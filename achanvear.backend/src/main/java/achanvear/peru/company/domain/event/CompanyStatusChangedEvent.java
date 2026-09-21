package achanvear.peru.company.domain.event;

import achanvear.peru.company.domain.model.CompanyId;
import achanvear.peru.company.domain.model.CompanyStatus;
import achanvear.peru.shared.domain.DomainEvent;

import java.time.Instant;
import java.util.Objects;

public record CompanyStatusChangedEvent(
        CompanyId companyId,
        CompanyStatus previousStatus,
        CompanyStatus newStatus,
        Instant occurredAt
) implements DomainEvent {

    public CompanyStatusChangedEvent {
        Objects.requireNonNull(companyId, "Company id cannot be null");
        Objects.requireNonNull(previousStatus, "Previous status cannot be null");
        Objects.requireNonNull(newStatus, "New status cannot be null");
        Objects.requireNonNull(occurredAt, "Occurred at cannot be null");
    }

    public static CompanyStatusChangedEvent now(
            CompanyId companyId,
            CompanyStatus previousStatus,
            CompanyStatus newStatus
    ) {
        return new CompanyStatusChangedEvent(companyId, previousStatus, newStatus, Instant.now());
    }
}