package achanvear.peru.jobs.application.command;

import java.util.Map;

/**
 * Command to configure recruitment automation for a job post.
 * Defines automation level and settings for Python bot integration.
 */
public record ConfigureAutomationCommand(
        String jobPostId,
        String companyId,
        boolean superAdmin,
        String automationLevel,
        boolean autoSendInterviewInvites,
        String autoInterviewTimeoutMinutes,
        Map<String, String> screeningCriteria,
        String webhookUrl,
        String notificationTiming
) {
}
