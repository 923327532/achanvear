package achanvear.peru.payments.application.dto;

import java.math.BigDecimal;

public record RefundResponse(
        String refundId,
        String milestoneId,
        BigDecimal amount,
        String reason,
        String mpRefundId,
        String status,
        String processedAt,
        String createdAt
) {
}
