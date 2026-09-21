package achanvear.peru.notifications.infrastructure.external;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Component
public class N8nWebhookClient {

    private final RestClient restClient;
    private final String webhookUrl;

    public N8nWebhookClient(
            RestClient.Builder restClientBuilder,
            @Value("${n8n.webhook.notifications-url}") String webhookUrl
    ) {
        this.restClient = restClientBuilder.build();
        this.webhookUrl = webhookUrl;
    }

    public void triggerJobNotification(String jobId, String title) {
        Map<String, Object> payload = Map.of(
                "event", "JOB_PUBLISHED",
                "jobId", jobId,
                "title", title
        );

        restClient.post()
                .uri(webhookUrl)
                .body(payload)
                .retrieve()
                .toBodilessEntity();
    }

    public void triggerInterviewInvitation(String recipient, String interviewId) {
        Map<String, Object> payload = Map.of(
                "event", "INTERVIEW_INVITATION",
                "recipient", recipient,
                "interviewId", interviewId
        );

        restClient.post()
                .uri(webhookUrl)
                .body(payload)
                .retrieve()
                .toBodilessEntity();
    }

    public void triggerNotificationEvent(String recipient, String type, String subject) {
        Map<String, Object> payload = Map.of(
                "event", "NOTIFICATION_SENT",
                "recipient", recipient,
                "type", type,
                "subject", subject
        );

        restClient.post()
                .uri(webhookUrl)
                .body(payload)
                .retrieve()
                .toBodilessEntity();
    }
}
