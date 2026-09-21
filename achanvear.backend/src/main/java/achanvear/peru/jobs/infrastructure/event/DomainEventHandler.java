package achanvear.peru.jobs.infrastructure.event;

import achanvear.peru.jobs.domain.event.ApplicationSubmittedEvent;
import achanvear.peru.jobs.domain.event.JobPublishedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class DomainEventHandler {

    @EventListener
    public void handleJobPublished(JobPublishedEvent event) {
        // Trigger notifications or async workflows after a job post is published.
        // Example integrations can be added here:
        // - n8n webhook trigger
        // - notification module call
        // - analytics event tracking
    }

    @EventListener
    public void handleApplicationSubmitted(ApplicationSubmittedEvent event) {
        // Trigger candidate notification, company alerts or hiring pipeline initialization.
        // Example integrations can be added here:
        // - send notification to company admins
        // - create hiring pipeline draft
        // - push event to analytics
    }
}