package achanvear.peru.jobs.application.dto;

import java.util.Map;

/**
 * DTO for recruitment automation configuration response.
 */
public record RecruitmentAutomationConfigResponse(
        String jobPostId,
        String automationLevel,
        boolean autoSendInterviewInvites,
        String autoInterviewTimeoutMinutes,
        Map<String, String> screeningCriteria,
        String webhookUrl,
        String configuredAt,
        String notificationTiming
) {
}
