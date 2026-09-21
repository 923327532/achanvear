package achanvear.peru.payments.application.command;

import java.math.BigDecimal;
import java.util.UUID;

public record CreateMilestoneDepositIntentCommand(
        UUID projectId,
        UUID clientUserId,
        UUID freelancerUserId,
        String title,
        String description,
        BigDecimal amount,
        String clientEmail,
        String ipAddress,
        String userAgent
) {
    public CreateMilestoneDepositIntentCommand(
            UUID projectId,
            UUID clientUserId,
            UUID freelancerUserId,
            String title,
            String description,
            BigDecimal amount,
            String clientEmail
    ) {
        this(projectId, clientUserId, freelancerUserId, title, description, amount, clientEmail, null, null);
    }
}
