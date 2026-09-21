package achanvear.peru.payments.infrastructure.external;

import java.math.BigDecimal;

public record MercadoPagoRefundRequest(
        BigDecimal amount
) {
}
