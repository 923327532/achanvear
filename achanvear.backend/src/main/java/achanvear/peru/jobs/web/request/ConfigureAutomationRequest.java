package achanvear.peru.jobs.web.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import java.util.Map;

/**
 * Request DTO for configuring recruitment automation.
 * Defines automation level for Python bot integration.
 */
public record ConfigureAutomationRequest(
        @NotBlank @Pattern(regexp = "MANUAL|SEMI_AUTOMATED|FULLY_AUTOMATED") String automationLevel,
        boolean autoSendInterviewInvites,
        String autoInterviewTimeoutMinutes,
        Map<String, String> screeningCriteria,
        String webhookUrl,
        String notificationTiming
) {
}
