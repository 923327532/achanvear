package achanvear.peru.jobs.infrastructure.external;

import achanvear.peru.jobs.application.port.out.AutomationWebhookPort;
import achanvear.peru.jobs.domain.model.JobApplication;
import achanvear.peru.jobs.domain.model.RecruitmentAutomationConfig;
import achanvear.peru.jobs.domain.model.RecruitmentAutomationLevel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Adapter for sending webhooks to external automation systems (Python bot).
 * Stub implementation ready for Python bot integration.
 */
@Component
public class AutomationWebhookAdapter implements AutomationWebhookPort {

    private static final Logger logger = LoggerFactory.getLogger(AutomationWebhookAdapter.class);

    @Override
    public void notifyApplicationReceived(RecruitmentAutomationConfig config, JobApplication application) {
        if (config.getWebhookUrl() == null || config.getWebhookUrl().isBlank()) {
            logger.info("No webhook configured for job post: {}", config.getJobPostId());
            return;
        }

        logger.info(
                "[WEBHOOK STUB] Notifying application received. JobPost: {}, Application: {}, Level: {}",
                config.getJobPostId(),
                application.getId(),
                config.getLevel()
        );

        // Python bot will consume this webhook
        // TODO: Implement HTTP POST to config.getWebhookUrl()
    }

    @Override
    public void notifyScreeningRequired(RecruitmentAutomationConfig config, JobApplication application, String triggerEvent) {
        if (config.getLevel() == RecruitmentAutomationLevel.MANUAL) {
            logger.debug("Manual mode - skipping automated screening notification");
            return;
        }

        logger.info(
                "[WEBHOOK STUB] Screening required. JobPost: {}, Application: {}, Event: {}",
                config.getJobPostId(),
                application.getId(),
                triggerEvent
        );

        // Python bot will handle screening logic
        // TODO: Implement HTTP POST with screening payload
    }

    @Override
    public void sendInterviewInvitation(RecruitmentAutomationConfig config, JobApplication application, InterviewData interviewData) {
        if (!config.isAutoSendInterviewInvites()) {
            logger.debug("Auto interview disabled for job post: {}", config.getJobPostId());
            return;
        }

        logger.info(
                "[WEBHOOK STUB] Sending interview invitation. JobPost: {}, Application: {}, Type: {}",
                config.getJobPostId(),
                application.getId(),
                interviewData.interviewType()
        );

        // Python bot will handle interview scheduling
        // TODO: Implement HTTP POST with interview data
    }
}
