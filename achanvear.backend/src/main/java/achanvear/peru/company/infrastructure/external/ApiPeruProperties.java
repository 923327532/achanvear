package achanvear.peru.company.infrastructure.external;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "apiperu")
public record ApiPeruProperties(
        String token,
        String baseUrl
) {
}
