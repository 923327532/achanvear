package achanvear.peru.company.domain.event;

import achanvear.peru.company.domain.model.CompanyId;
import achanvear.peru.company.domain.model.CompanyStatus;
import achanvear.peru.shared.domain.DomainEvent;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

public record CompanyCreatedEvent(
        CompanyId companyId,
        UUID ownerUserId,
        String businessName,
        CompanyStatus status,
        Instant occurredAt
) implements DomainEvent {

    public CompanyCreatedEvent {
        Objects.requireNonNull(companyId, "Company id cannot be null");
        Objects.requireNonNull(ownerUserId, "Owner user id cannot be null");
        Objects.requireNonNull(businessName, "Business name cannot be null");
        Objects.requireNonNull(status, "Company status cannot be null");
        Objects.requireNonNull(occurredAt, "Occurred at cannot be null");
    }

    public static CompanyCreatedEvent now(
            CompanyId companyId,
            UUID ownerUserId,
            String businessName,
            CompanyStatus status
    ) {
        return new CompanyCreatedEvent(companyId, ownerUserId, businessName, status, Instant.now());
    }
}