package achanvear.peru.payments.infrastructure.external;

public record MercadoPagoPreferenceItem(
        String title,
        String description,
        int unit_price,
        int quantity
) {
}
