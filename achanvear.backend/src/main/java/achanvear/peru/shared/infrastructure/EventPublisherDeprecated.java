package achanvear.peru.shared.infrastructure;

import achanvear.peru.shared.domain.DomainEvent;

// Deprecated - Use achanvear.peru.shared.application.EventPublisher instead
@Deprecated
public interface EventPublisherDeprecated {

    void publish(DomainEvent event);
}