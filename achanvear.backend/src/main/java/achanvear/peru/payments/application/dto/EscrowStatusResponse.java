package achanvear.peru.payments.application.dto;

import java.math.BigDecimal;

public record EscrowStatusResponse(
        String escrowId,
        String milestoneId,
        String projectId,
        BigDecimal amount,
        BigDecimal platformCommission,
        BigDecimal mpCommission,
        BigDecimal freelancerAmount,
        @io.swagger.v3.oas.annotations.media.Schema(implementation = achanvear.peru.payments.domain.model.EscrowStatus.class) String status,
        String heldAt,
        String releasedAt,
        String refundedAt,
        String disputedAt,
        String disputeReason,
        String projectTitle
) {
}
