package achanvear.peru.payments.application.dto;

import java.math.BigDecimal;

public record MilestonePaymentDetailResponse(
        String milestoneId,
        String projectId,
        String title,
        String description,
        BigDecimal amount,
        String status,
        String freelancerUserId,
        String clientUserId,
        String fundedAt,
        String releasedAt,
        String mpPaymentId,
        String nextAction
) {
}
