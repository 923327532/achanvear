package achanvear.peru.profile.infrastructure.external;

import achanvear.peru.profile.application.port.out.ProfileStoragePort;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.core.ResponseBytes;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;
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
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(properties.bucket())
                .key(fileKey)
                .build();

        ResponseBytes<GetObjectResponse> objectBytes = s3Client.getObjectAsBytes(getObjectRequest);
        return objectBytes.asByteArray();
    }


    @Override
    public PresignedUploadResponse generatePresignedUploadUrl(
            String folder,
            String fileName,
            String contentType
    ) {
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

        PresignedPutObjectRequest presignedRequest = s3Presigner.presignPutObject(presignRequest);

        return new PresignedUploadResponse(
                fileKey,
                presignedRequest.url().toString(),
                buildS3ObjectUrl(fileKey)
        );
    }

    private String resolveAllowedFolder(String folder) {
        ProfileStorageFolder storageFolder = ProfileStorageFolder.valueOf(folder.trim().toUpperCase());

        return switch (storageFolder) {
            case PROFILE_PHOTO -> properties.profilePhotoFolder();
            case CURRICULUM -> properties.curriculumFolder();
            case PORTFOLIO -> properties.portfolioFolder();
        };
    }

    private String sanitizeFileName(String fileName) {
        return fileName.trim().replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    private String buildS3ObjectUrl(String fileKey) {
        return "https://" + properties.bucket() + ".s3." + properties.region() + ".amazonaws.com/" + fileKey;
    }
}