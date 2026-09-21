package achanvear.peru.jobs.domain.model;

import java.time.Duration;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;

/**
 * Configuration for recruitment automation per job post.
 * Defines automation level and settings for Python bot integration.
 */
public class RecruitmentAutomationConfig {

    private final UUID jobPostId;
    private RecruitmentAutomationLevel level;
    private boolean autoSendInterviewInvites;
    private Duration autoInterviewTimeout;
    private Map<String, String> screeningCriteria;
    private String webhookUrl;
    private NotificationTiming notificationTiming;

    private RecruitmentAutomationConfig(
            UUID jobPostId,
            RecruitmentAutomationLevel level,
            boolean autoSendInterviewInvites,
            Duration autoInterviewTimeout,
            Map<String, String> screeningCriteria,
            String webhookUrl,
            NotificationTiming notificationTiming
    ) {
        this.jobPostId = Objects.requireNonNull(jobPostId, "Job post id cannot be null");
        this.level = Objects.requireNonNull(level, "Automation level cannot be null");
        this.autoSendInterviewInvites = autoSendInterviewInvites;
        this.autoInterviewTimeout = autoInterviewTimeout;
        this.screeningCriteria = screeningCriteria != null ? Map.copyOf(screeningCriteria) : Map.of();
        this.webhookUrl = webhookUrl;
        this.notificationTiming = notificationTiming != null ? notificationTiming : NotificationTiming.IMMEDIATE;
    }

    public static RecruitmentAutomationConfig create(
            UUID jobPostId,
            RecruitmentAutomationLevel level
    ) {
        return new RecruitmentAutomationConfig(
                jobPostId,
                level,
                false,
                null,
                Map.of(),
                null,
                NotificationTiming.IMMEDIATE
        );
    }

    public static RecruitmentAutomationConfig create(
            UUID jobPostId,
            RecruitmentAutomationLevel level,
            NotificationTiming notificationTiming
    ) {
        return new RecruitmentAutomationConfig(
                jobPostId,
                level,
                false,
                null,
                Map.of(),
                null,
                notificationTiming
        );
    }

    public static RecruitmentAutomationConfig restore(
            UUID jobPostId,
            RecruitmentAutomationLevel level,
            boolean autoSendInterviewInvites,
            Duration autoInterviewTimeout,
            Map<String, String> screeningCriteria,
            String webhookUrl,
            NotificationTiming notificationTiming
    ) {
        return new RecruitmentAutomationConfig(
                jobPostId,
                level,
                autoSendInterviewInvites,
                autoInterviewTimeout,
                screeningCriteria,
                webhookUrl,
                notificationTiming
        );
    }

    public void updateLevel(RecruitmentAutomationLevel newLevel) {
        this.level = Objects.requireNonNull(newLevel, "Level cannot be null");
    }

    public void enableAutoInterview(Duration timeout, String webhook) {
        this.autoSendInterviewInvites = true;
        this.autoInterviewTimeout = timeout;
        this.webhookUrl = webhook;
    }

    public void updateScreeningCriteria(Map<String, String> criteria) {
        this.screeningCriteria = criteria != null ? Map.copyOf(criteria) : Map.of();
    }

    public UUID getJobPostId() {
        return jobPostId;
    }

    public RecruitmentAutomationLevel getLevel() {
        return level;
    }

    public boolean isAutoSendInterviewInvites() {
        return autoSendInterviewInvites;
    }

    public Duration getAutoInterviewTimeout() {
        return autoInterviewTimeout;
    }

    public Map<String, String> getScreeningCriteria() {
        return screeningCriteria;
    }

    public String getWebhookUrl() {
        return webhookUrl;
    }

    public NotificationTiming getNotificationTiming() {
        return notificationTiming;
    }

    public void setNotificationTiming(NotificationTiming notificationTiming) {
        this.notificationTiming = notificationTiming != null ? notificationTiming : NotificationTiming.IMMEDIATE;
    }
}
