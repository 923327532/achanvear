package achanvear.peru.payments.infrastructure.external;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.mercadopago")
public record MercadoPagoProperties(
        String accessToken,
        String publicKey,
        String webhookSecret,
        String successUrl,
        String failureUrl,
        String pendingUrl
) {
}