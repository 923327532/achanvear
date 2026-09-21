package achanvear.peru.payments.application.dto;

public record MilestoneDepositIntentResponse(
        String milestoneId,
        String preferenceId,
        String initPoint,
        String sandboxInitPoint,
        String status
) {
}
