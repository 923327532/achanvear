package achanvear.peru.shared.infrastructure.impl;

import achanvear.peru.shared.domain.DomainEvent;
import achanvear.peru.shared.infrastructure.EventPublisher;
import org.springframework.stereotype.Component;

@Component
public class EventPublisherImpl implements EventPublisher {

    private final org.springframework.context.ApplicationEventPublisher publisher;
    public EventPublisherImpl(org.springframework.context.ApplicationEventPublisher publisher) { this.publisher = publisher; }
    @Override
    public void publish(DomainEvent event) { publisher.publishEvent(event); }
}
