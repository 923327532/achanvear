package achanvear.peru.freelance.application.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record ProposalResponse(
        String id,
        String freelancerUserId,
        String coverLetter,
        BigDecimal proposedBudget,
        Integer estimatedDays,
        String portfolioUrl,
        Instant submittedAt,
        String status
) {
}
