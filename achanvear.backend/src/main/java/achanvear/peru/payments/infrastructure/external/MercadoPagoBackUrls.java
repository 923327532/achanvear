package achanvear.peru.payments.infrastructure.external;

public record MercadoPagoBackUrls(
        String success,
        String failure,
        String pending
) {
}
