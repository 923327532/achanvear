package achanvear.peru.payments.infrastructure.external;

public record CreateMilestonePreferenceRequest(
        MercadoPagoPreferenceItem items,
        MercadoPagoPreferencePayer payer,
        MercadoPagoBackUrls back_urls,
        String external_reference,
        boolean auto_return
) {
}
