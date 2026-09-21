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
        String status,
        String heldAt,
        String releasedAt,
        String refundedAt,
        String disputedAt,
        String disputeReason
) {
}
