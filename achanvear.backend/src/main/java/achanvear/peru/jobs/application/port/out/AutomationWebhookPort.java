package achanvear.peru.jobs.application.port.out;

import achanvear.peru.jobs.domain.model.JobApplication;
import achanvear.peru.jobs.domain.model.RecruitmentAutomationConfig;

/**
 * Port for sending webhooks to external automation systems (Python bot).
 * Enables integration with external automation workflows.
 */
public interface AutomationWebhookPort {

    /**
     * Notifies external system about new job application.
     * Triggered when a freelancer applies to a job.
     *
     * @param config the automation configuration
     * @param application the job application
     */
    void notifyApplicationReceived(RecruitmentAutomationConfig config, JobApplication application);

    /**
     * Notifies external system about status change requiring automation.
     * Triggered when application moves to screening stage.
     *
     * @param config the automation configuration
     * @param application the job application
     * @param triggerEvent the event that triggered this notification
     */
    void notifyScreeningRequired(RecruitmentAutomationConfig config, JobApplication application, String triggerEvent);

    /**
     * Sends interview invitation through external system.
     * Used by Python bot to schedule automated interviews.
     *
     * @param config the automation configuration
     * @param application the job application
     * @param interviewData data for interview scheduling
     */
    void sendInterviewInvitation(RecruitmentAutomationConfig config, JobApplication application, InterviewData interviewData);

    /**
     * Data for interview scheduling.
     */
    record InterviewData(
            String interviewType,
            String scheduledDate,
            String duration,
            String meetingLink,
            String questionsJson
    ) {
    }
}
