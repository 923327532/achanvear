package achanvear.peru.shared.infrastructure.impl;

import achanvear.peru.shared.domain.DomainEvent;
import achanvear.peru.shared.infrastructure.EventPublisher;
import org.springframework.stereotype.Component;

@Component
public class EventPublisherImpl implements EventPublisher {

    @Override
    public void publish(DomainEvent event) {
        // TODO: Implement actual event publishing to message broker or event store
        // For now, just log the event
        System.out.println("Publishing event: " + event.getClass().getSimpleName() + " at " + java.time.Instant.now());
    }
}
