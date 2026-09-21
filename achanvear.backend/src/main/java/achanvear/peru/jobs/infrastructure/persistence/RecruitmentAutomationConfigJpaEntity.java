package achanvear.peru.jobs.infrastructure.persistence;

import achanvear.peru.shared.infrastructure.BaseJpaEntity;
import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "recruitment_automation_configs")
public class RecruitmentAutomationConfigJpaEntity extends BaseJpaEntity {

    @Id
    @Column(name = "job_post_id", nullable = false, updatable = false)
    private UUID jobPostId;

    @Column(name = "automation_level", nullable = false, length = 30)
    private String level;

    @Column(name = "auto_send_interview_invites", nullable = false)
    private boolean autoSendInterviewInvites;

    @Column(name = "auto_interview_timeout_minutes")
    private Integer autoInterviewTimeoutMinutes;

    @Column(name = "screening_criteria", columnDefinition = "jsonb")
    private String screeningCriteria;

    @Column(name = "webhook_url", length = 500)
    private String webhookUrl;

    @Column(name = "notification_timing", length = 30)
    private String notificationTiming;

    public RecruitmentAutomationConfigJpaEntity() {
    }

    public UUID getJobPostId() {
        return jobPostId;
    }

    public void setJobPostId(UUID jobPostId) {
        this.jobPostId = jobPostId;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public boolean isAutoSendInterviewInvites() {
        return autoSendInterviewInvites;
    }

    public void setAutoSendInterviewInvites(boolean autoSendInterviewInvites) {
        this.autoSendInterviewInvites = autoSendInterviewInvites;
    }

    public Integer getAutoInterviewTimeoutMinutes() {
        return autoInterviewTimeoutMinutes;
    }

    public void setAutoInterviewTimeoutMinutes(Integer autoInterviewTimeoutMinutes) {
        this.autoInterviewTimeoutMinutes = autoInterviewTimeoutMinutes;
    }

    public String getScreeningCriteria() {
        return screeningCriteria;
    }

    public void setScreeningCriteria(String screeningCriteria) {
        this.screeningCriteria = screeningCriteria;
    }

    public String getWebhookUrl() {
        return webhookUrl;
    }

    public void setWebhookUrl(String webhookUrl) {
        this.webhookUrl = webhookUrl;
    }

    public String getNotificationTiming() {
        return notificationTiming;
    }

    public void setNotificationTiming(String notificationTiming) {
        this.notificationTiming = notificationTiming;
    }
}
