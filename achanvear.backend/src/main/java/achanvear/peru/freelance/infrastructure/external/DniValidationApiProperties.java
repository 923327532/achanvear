package achanvear.peru.freelance.infrastructure.external;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "integration.dni")
public record DniValidationApiProperties(
        String baseUrl,
        String token
) {
}