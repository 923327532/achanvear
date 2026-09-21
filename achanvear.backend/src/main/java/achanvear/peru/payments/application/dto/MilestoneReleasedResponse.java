package achanvear.peru.payments.application.dto;

import java.math.BigDecimal;

public record MilestoneReleasedResponse(
        String milestoneId,
        String status,
        BigDecimal releasedAmount,
        BigDecimal platformCommission,
        BigDecimal mpCommission,
        BigDecimal freelancerNetAmount,
        String releasedAt
) {
}
