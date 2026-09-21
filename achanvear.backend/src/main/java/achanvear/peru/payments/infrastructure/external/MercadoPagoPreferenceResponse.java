package achanvear.peru.payments.infrastructure.external;

public record MercadoPagoPreferenceResponse(
        String id,
        String initPoint,
        String sandboxInitPoint
) {
}