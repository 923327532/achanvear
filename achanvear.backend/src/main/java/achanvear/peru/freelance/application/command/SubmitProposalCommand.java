package achanvear.peru.freelance.application.command;

import java.math.BigDecimal;

public record SubmitProposalCommand(
        String projectId,
        String freelancerUserId,
        String coverLetter,
        BigDecimal proposedBudget,
        Integer estimatedDays,
        String portfolioUrl
) {
}
