package achanvear.peru.freelance.infrastructure.config;

import achanvear.peru.freelance.infrastructure.external.AwsS3Properties;
import achanvear.peru.freelance.infrastructure.external.DniValidationApiProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties({AwsS3Properties.class, DniValidationApiProperties.class})
public class FreelanceProperties {
}
