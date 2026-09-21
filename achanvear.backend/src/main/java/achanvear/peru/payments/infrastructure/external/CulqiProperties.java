package achanvear.peru.payments.infrastructure.external;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.culqi")
public record CulqiProperties(
        String publicKey,
        String secretKey,
        String baseUrl,
        String currencyCode
) {
}
