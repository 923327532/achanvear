package achanvear.peru.payments.infrastructure.external;

import java.math.BigDecimal;

public record MercadoPagoPaymentResponse(
        String id,
        String status,
        BigDecimal transactionAmount,
        String external_reference,
        MercadoPagoPayer payer
) {
    public boolean isApproved() {
        return "approved".equals(status);
    }

    public String externalReference() {
        return external_reference;
    }
}

record MercadoPagoPayer(
        String id
) {
}
