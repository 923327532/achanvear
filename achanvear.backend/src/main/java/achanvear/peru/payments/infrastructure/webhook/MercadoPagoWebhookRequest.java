package achanvear.peru.payments.infrastructure.webhook;

public record MercadoPagoWebhookRequest(
        String type,
        MercadoPagoWebhookData data
) {
    public record MercadoPagoWebhookData(
            String id,
            String status
    ) {
    }
}