package achanvear.peru.shared.application;

import achanvear.peru.shared.domain.DomainEvent;

public interface EventPublisher {

    void publish(DomainEvent event);
}
