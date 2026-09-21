package achanvear.peru.shared.infrastructure;

import achanvear.peru.shared.domain.DomainEvent;

public interface EventPublisher {

    void publish(DomainEvent event);
}