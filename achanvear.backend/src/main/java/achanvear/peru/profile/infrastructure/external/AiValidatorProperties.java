package achanvear.peru.profile.infrastructure.external;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.external.ai-validator")
public record AiValidatorProperties(
        String baseUrl
) {
}