package achanvear.peru.freelance.infrastructure.external;

import achanvear.peru.freelance.application.port.out.StoragePort;
import org.springframework.stereotype.Component;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.awscore.exception.AwsServiceException;
import software.amazon.awssdk.core.exception.SdkClientException;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.*;
import achanvear.peru.freelance.infrastructure.external.FreelanceStorageFolder;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.UUID;

@Component
public class S3StorageAdapter implements StoragePort {

    private static final long MAX_CV_BYTES = 10 * 1024 * 1024;
    private static final int MAX_CV_PAGES = 20;
    private static final int MAX_CV_TEXT_LENGTH = 15_000;

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final AwsS3Properties properties;

    public S3StorageAdapter(
            S3Client s3Client,
            S3Presigner s3Presigner,
            AwsS3Properties properties
    ) {
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
        this.properties = properties;
    }

    @Override
    public PresignedUploadResponse generatePresignedUploadUrl(
            String folder,
            String fileName,
            String contentType
    ) {
        validateStorageConfiguration();
        String resolvedFolder = resolveAllowedFolder(folder);
        String safeFileName = sanitizeFileName(fileName);
        String fileKey = resolvedFolder + "/" + UUID.randomUUID() + "-" + safeFileName;

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(properties.bucket())
                .key(fileKey)
                .contentType(contentType)
                .build();

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(properties.uploadExpirationMinutes()))
                .putObjectRequest(putObjectRequest)
                .build();

        PresignedPutObjectRequest presignedRequest;
        try {
            presignedRequest = s3Presigner.presignPutObject(presignRequest);
        } catch (AwsServiceException | SdkClientException exception) {
            throw new IllegalStateException("No se pudo generar la URL de subida. Revisa credenciales AWS, region y bucket S3.", exception);
        }

        return new PresignedUploadResponse(
                fileKey,
                presignedRequest.url().toString(),
                buildS3ObjectUrl(fileKey)
        );
    }

    @Override
    public UploadResponse uploadFile(
            String folder,
            String fileName,
            String contentType,
            byte[] fileContent
    ) {
        validateStorageConfiguration();
        String resolvedFolder = resolveAllowedFolder(folder);
        String safeFileName = sanitizeFileName(fileName);
        String fileKey = resolvedFolder + "/" + UUID.randomUUID() + "-" + safeFileName;

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(properties.bucket())
                .key(fileKey)
                .contentType(contentType)
                .build();

        try {
            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(fileContent));
        } catch (AwsServiceException | SdkClientException exception) {
            throw new IllegalStateException("No se pudo subir el archivo. Revisa credenciales AWS, region y bucket S3.", exception);
        }

        return new UploadResponse(
                fileKey,
                buildS3ObjectUrl(fileKey)
        );
    }

    @Override
    public PresignedDownloadResponse generatePresignedDownloadUrl(String fileKey) {
        validateStorageConfiguration();
        if (fileKey == null || fileKey.isBlank()) {
            throw new IllegalArgumentException("File key cannot be blank");
        }

        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(properties.bucket())
                .key(fileKey)
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(properties.downloadExpirationMinutes()))
                .getObjectRequest(getObjectRequest)
                .build();

        PresignedGetObjectRequest presignedRequest;
        try {
            presignedRequest = s3Presigner.presignGetObject(presignRequest);
        } catch (AwsServiceException | SdkClientException exception) {
            throw new IllegalStateException("No se pudo generar la URL de descarga. Revisa credenciales AWS, region y bucket S3.", exception);
        }

        return new PresignedDownloadResponse(fileKey, presignedRequest.url().toString());
    }

    @Override
    public byte[] downloadFile(String fileKey) {
        validateStorageConfiguration();
        if (fileKey == null || fileKey.isBlank()) {
            throw new IllegalArgumentException("File key cannot be blank");
        }

        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(properties.bucket())
                .key(fileKey)
                .build();

        ResponseBytes<GetObjectResponse> objectBytes = s3Client.getObjectAsBytes(getObjectRequest);
        return objectBytes.asByteArray();
    }

    @Override
    public String extractPdfText(String publicFileUrl) {
        validateStorageConfiguration();
        URI uri = URI.create(publicFileUrl);
        String expectedHost = properties.bucket() + ".s3." + properties.region() + ".amazonaws.com";
        if (!"https".equalsIgnoreCase(uri.getScheme()) || !expectedHost.equalsIgnoreCase(uri.getHost())) {
            throw new IllegalArgumentException("CV URL must point to the configured S3 bucket");
        }

        String fileKey = URLDecoder.decode(uri.getRawPath().substring(1), StandardCharsets.UTF_8);
        String curriculumPrefix = properties.curriculumFolder() + "/";
        if (!fileKey.startsWith(curriculumPrefix)) {
            throw new IllegalArgumentException("CV must be stored in the curriculum folder");
        }

        HeadObjectRequest headRequest = HeadObjectRequest.builder()
                .bucket(properties.bucket())
                .key(fileKey)
                .build();
        long contentLength = s3Client.headObject(headRequest).contentLength();
        if (contentLength <= 0 || contentLength > MAX_CV_BYTES) {
            throw new IllegalArgumentException("CV PDF must be between 1 byte and 10 MB");
        }

        GetObjectRequest getRequest = GetObjectRequest.builder()
                .bucket(properties.bucket())
                .key(fileKey)
                .build();
        ResponseBytes<GetObjectResponse> response = s3Client.getObjectAsBytes(getRequest);
        try (PDDocument document = Loader.loadPDF(response.asByteArray())) {
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setStartPage(1);
            stripper.setEndPage(Math.min(document.getNumberOfPages(), MAX_CV_PAGES));
            String extractedText = stripper.getText(document).replaceAll("\\s+", " ").trim();
            return extractedText.substring(0, Math.min(extractedText.length(), MAX_CV_TEXT_LENGTH));
        } catch (java.io.IOException exception) {
            throw new IllegalArgumentException("CV file is not a readable PDF", exception);
        }
    }

    private void validateStorageConfiguration() {
        if (isBlank(properties.bucket())) {
            throw new IllegalStateException("AWS_S3_BUCKET_NAME no esta configurado");
        }
        if (isBlank(properties.region())) {
            throw new IllegalStateException("AWS_REGION no esta configurado");
        }
        if (properties.uploadExpirationMinutes() <= 0 || properties.downloadExpirationMinutes() <= 0) {
            throw new IllegalStateException("La expiracion de URLs S3 no esta configurada correctamente");
        }
    }

    private String resolveAllowedFolder(String folder) {
        if (folder == null || folder.isBlank()) {
            throw new IllegalArgumentException("Folder cannot be blank");
        }

        FreelanceStorageFolder storageFolder = FreelanceStorageFolder.valueOf(folder.trim().toUpperCase());

        String resolvedFolder = switch (storageFolder) {
            case PROFILE_PHOTO -> properties.profilePhotoFolder();
            case CURRICULUM -> properties.curriculumFolder();
            case SERVICE_IMAGES -> properties.serviceImagesFolder();
            case SERVICE_VIDEOS -> properties.serviceVideosFolder();
            case SERVICE_PDFS -> properties.servicePdfsFolder();
            case SERVICE_CERTIFICATES -> properties.serviceCertificatesFolder();
            case CHAT_ATTACHMENTS -> properties.chatAttachmentsFolder();
        };

        // Sin esta validacion, una carpeta sin configurar generaba claves tipo
        // "null/uuid-archivo.png" y URLs presignadas invalidas hacia S3.
        if (isBlank(resolvedFolder)) {
            throw new IllegalStateException(
                    "La carpeta S3 para " + storageFolder + " no esta configurada en aws.s3"
            );
        }

        return resolvedFolder.trim();
    }

    private String sanitizeFileName(String fileName) {
        if (fileName == null || fileName.isBlank()) {
            throw new IllegalArgumentException("File name cannot be blank");
        }

        return fileName.trim().replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String buildS3ObjectUrl(String fileKey) {
        return "https://" + properties.bucket() + ".s3." + properties.region() + ".amazonaws.com/" + fileKey;
    }
}
