package achanvear.peru.shared.domain;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public abstract class AggregateRoot<S> {

    private final List<DomainEvent> domainEvents = new ArrayList<>();

    protected void markUpdated() {
        // Hook for tracking aggregate modifications
        // Can be extended to update timestamps or version numbers
    }

    protected void registerEvent(DomainEvent event) {
        domainEvents.add(event);
    }

    protected void addDomainEvent(DomainEvent event) {
        registerEvent(event);
    }

    public List<DomainEvent> getDomainEvents() {
        return Collections.unmodifiableList(domainEvents);
    }

    public void clearDomainEvents() {
        domainEvents.clear();
    }

    public List<DomainEvent> pullDomainEvents() {
        List<DomainEvent> events = new ArrayList<>(domainEvents);
        domainEvents.clear();
        return events;
    }
}