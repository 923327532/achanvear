package achanvear.peru.profile.infrastructure.external;

import achanvear.peru.profile.application.port.out.ProfileStoragePort;
import software.amazon.awssdk.core.sync.RequestBody;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.core.exception.SdkClientException;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.awscore.exception.AwsServiceException;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;
import java.util.UUID;


@Component
public class S3ProfileStorageAdapter implements ProfileStoragePort {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final AwsProfileS3Properties properties;

    public S3ProfileStorageAdapter(
            S3Client s3Client,
            S3Presigner s3Presigner,
            AwsProfileS3Properties properties
    ) {
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
        this.properties = properties;
    }

    @Override
    public byte[] downloadFile(String fileKey) {
        validateStorageConfiguration();
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(properties.bucket())
                .key(fileKey)
                .build();

        ResponseBytes<GetObjectResponse> objectBytes = s3Client.getObjectAsBytes(getObjectRequest);
        return objectBytes.asByteArray();
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
                .signatureDuration(Duration.ofMinutes(properties.uploadExpirationMinutes()))
                .getObjectRequest(getObjectRequest)
                .build();

        PresignedGetObjectRequest presignedRequest;
        try {
            presignedRequest = s3Presigner.presignGetObject(presignRequest);
        } catch (SdkClientException | AwsServiceException exception) {
            throw new IllegalStateException("No se pudo generar la URL de lectura. Revisa permisos GetObject, region y bucket S3.", exception);
        }

        return new PresignedDownloadResponse(fileKey, presignedRequest.url().toString());
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
        } catch (SdkClientException | AwsServiceException exception) {
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
        } catch (SdkClientException | AwsServiceException exception) {
            throw new IllegalStateException("No se pudo subir el archivo. Revisa credenciales AWS, region y bucket S3.", exception);
        }

        return new UploadResponse(fileKey, buildS3ObjectUrl(fileKey));
    }

    private void validateStorageConfiguration() {
        if (isBlank(properties.bucket())) {
            throw new IllegalStateException("AWS_S3_BUCKET_NAME no esta configurado");
        }
        if (isBlank(properties.region())) {
            throw new IllegalStateException("AWS_REGION no esta configurado");
        }
        if (properties.uploadExpirationMinutes() <= 0) {
            throw new IllegalStateException("La expiracion de subida S3 no esta configurada correctamente");
        }
    }

    private String resolveAllowedFolder(String folder) {
        if (folder == null || folder.isBlank()) {
            throw new IllegalArgumentException("Folder cannot be blank");
        }

        ProfileStorageFolder storageFolder = ProfileStorageFolder.valueOf(folder.trim().toUpperCase());

        String resolvedFolder = switch (storageFolder) {
            case PROFILE_PHOTO -> properties.profilePhotoFolder();
            case CURRICULUM -> properties.curriculumFolder();
            case PORTFOLIO -> properties.portfolioFolder();
        };

        // Sin esta validacion, una carpeta sin configurar generaba claves tipo
        // "null/uuid-archivo.png" y URLs presignadas invalidas hacia S3.
        if (isBlank(resolvedFolder)) {
            throw new IllegalStateException(
                    "La carpeta S3 para " + storageFolder + " no esta configurada en app.aws.s3.profile"
            );
        }

        return resolvedFolder.trim();
    }

    private String sanitizeFileName(String fileName) {
        return fileName.trim().replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String buildS3ObjectUrl(String fileKey) {
        return "https://" + properties.bucket() + ".s3." + properties.region() + ".amazonaws.com/" + fileKey;
    }
}
