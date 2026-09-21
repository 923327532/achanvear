package achanvear.peru.company.domain.event;

import achanvear.peru.company.domain.model.CompanyId;
import achanvear.peru.shared.domain.DomainEvent;

import java.time.Instant;
import java.util.Objects;

public record CompanyUpdatedEvent(
        CompanyId companyId,
        String businessName,
        Instant occurredAt
) implements DomainEvent {

    public CompanyUpdatedEvent {
        Objects.requireNonNull(companyId, "Company id cannot be null");
        Objects.requireNonNull(businessName, "Business name cannot be null");
        Objects.requireNonNull(occurredAt, "Occurred at cannot be null");
    }

    public static CompanyUpdatedEvent now(CompanyId companyId, String businessName) {
        return new CompanyUpdatedEvent(companyId, businessName, Instant.now());
    }
}