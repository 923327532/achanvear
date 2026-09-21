package achanvear.peru.freelance.infrastructure.external;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

@Configuration
@EnableConfigurationProperties(AwsS3Properties.class)
public class S3Config {

    private static final Logger logger = LoggerFactory.getLogger(S3Config.class);

    @Value("${aws.access-key:}")
    private String accessKey;

    @Value("${aws.secret-key:}")
    private String secretKey;

    @Bean
    public S3Client s3Client(AwsS3Properties properties) {
        // Intentar con aws.access-key / aws.secret-key de properties
        if (!accessKey.isEmpty() && !secretKey.isEmpty()) {
            logger.info("DEBUG AWS - Using credentials from properties");
            return S3Client.builder()
                    .region(Region.of(properties.region()))
                    .credentialsProvider(StaticCredentialsProvider.create(
                            AwsBasicCredentials.create(accessKey, secretKey)))
                    .build();
        }

        // Intentar con variables de entorno AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY
        String envAk = System.getenv("AWS_ACCESS_KEY_ID");
        String envSk = System.getenv("AWS_SECRET_ACCESS_KEY");
        if (envAk != null && !envAk.isEmpty() && envSk != null && !envSk.isEmpty()) {
            logger.info("DEBUG AWS - Using credentials from environment variables");
            return S3Client.builder()
                    .region(Region.of(properties.region()))
                    .credentialsProvider(StaticCredentialsProvider.create(
                            AwsBasicCredentials.create(envAk, envSk)))
                    .build();
        }

        logger.info("DEBUG AWS - Using DefaultCredentialsProvider");
        return S3Client.builder()
                .region(Region.of(properties.region()))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }

    @Bean
    public S3Presigner s3Presigner(AwsS3Properties properties) {
        if (!accessKey.isEmpty() && !secretKey.isEmpty()) {
            return S3Presigner.builder()
                    .region(Region.of(properties.region()))
                    .credentialsProvider(StaticCredentialsProvider.create(
                            AwsBasicCredentials.create(accessKey, secretKey)))
                    .build();
        }

        String envAk = System.getenv("AWS_ACCESS_KEY_ID");
        String envSk = System.getenv("AWS_SECRET_ACCESS_KEY");
        if (envAk != null && !envAk.isEmpty() && envSk != null && !envSk.isEmpty()) {
            logger.info("DEBUG AWS - Using credentials from environment variables");
            return S3Presigner.builder()
                    .region(Region.of(properties.region()))
                    .credentialsProvider(StaticCredentialsProvider.create(
                            AwsBasicCredentials.create(envAk, envSk)))
                    .build();
        }

        return S3Presigner.builder()
                .region(Region.of(properties.region()))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build();
    }
}
