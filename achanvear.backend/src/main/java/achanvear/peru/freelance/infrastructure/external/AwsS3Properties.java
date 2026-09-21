package achanvear.peru.freelance.infrastructure.external;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "aws.s3")
public record AwsS3Properties(
        String bucket,
        String region,
        String profilePhotoFolder,
        String curriculumFolder,
        String serviceImagesFolder,
        String serviceVideosFolder,
        String servicePdfsFolder,
        String serviceCertificatesFolder,
        String chatAttachmentsFolder,
        long uploadExpirationMinutes,
        long downloadExpirationMinutes
) {
}
