package achanvear.peru.company.domain.event;

import achanvear.peru.company.domain.model.CompanyId;
import achanvear.peru.shared.domain.DomainEvent;

import java.time.Instant;
import java.util.Objects;

public record CompanyDeactivatedEvent(
        CompanyId companyId,
        Instant occurredAt
) implements DomainEvent {

    public CompanyDeactivatedEvent {
        Objects.requireNonNull(companyId, "Company id cannot be null");
        Objects.requireNonNull(occurredAt, "Occurred at cannot be null");
    }

    public static CompanyDeactivatedEvent now(CompanyId companyId) {
        return new CompanyDeactivatedEvent(companyId, Instant.now());
    }
}