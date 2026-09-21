package achanvear.peru.profile.infrastructure.external;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.aws.s3.profile")
public record AwsProfileS3Properties(
        String bucket,
        String region,
        String profilePhotoFolder,
        String curriculumFolder,
        String portfolioFolder,
        long uploadExpirationMinutes
) {
}