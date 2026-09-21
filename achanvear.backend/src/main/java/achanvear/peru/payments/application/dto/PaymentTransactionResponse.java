package achanvear.peru.payments.application.dto;

import java.math.BigDecimal;

public record PaymentTransactionResponse(
        String transactionId,
        String type,
        String description,
        BigDecimal amount,
        String status,
        String createdAt,
        java.util.UUID relatedEntityId,
        String relatedEntityType
) {
}
