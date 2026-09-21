package achanvear.peru.notifications.infrastructure.event;

import achanvear.peru.notifications.domain.event.JobPublishedIntegrationEvent;
import achanvear.peru.notifications.domain.event.UserRegisteredIntegrationEvent;
import achanvear.peru.notifications.infrastructure.external.BrevoEmailClient;
import achanvear.peru.notifications.infrastructure.external.N8nWebhookClient;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class NotificationDomainEventHandler {

    private final N8nWebhookClient n8nWebhookClient;
    private final BrevoEmailClient brevoEmailClient;

    public NotificationDomainEventHandler(
            N8nWebhookClient n8nWebhookClient,
            BrevoEmailClient brevoEmailClient
    ) {
        this.n8nWebhookClient = n8nWebhookClient;
        this.brevoEmailClient = brevoEmailClient;
    }

    @EventListener
    public void handleUserRegistered(UserRegisteredIntegrationEvent event) {
        brevoEmailClient.sendWelcomeEmail(event.email());
    }

    @EventListener
    public void handleJobPublished(JobPublishedIntegrationEvent event) {
        n8nWebhookClient.triggerJobNotification(
                event.jobPostId(),
                event.title()
        );
    }
}
