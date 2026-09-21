package achanvear.peru.payments.infrastructure.external;

import java.math.BigDecimal;

public record MercadoPagoPaymentResponse(
        String id,
        String status,
        BigDecimal transactionAmount,
        MercadoPagoPayer payer
) {
    public boolean isApproved() {
        return "approved".equals(status);
    }
}

record MercadoPagoPayer(
        String id
) {
}