package achanvear.peru.payments.application.command;

import java.util.UUID;

public record ReleaseMilestonePaymentCommand(
        UUID milestoneId,
        UUID clientUserId,
        String comments
) {
}
