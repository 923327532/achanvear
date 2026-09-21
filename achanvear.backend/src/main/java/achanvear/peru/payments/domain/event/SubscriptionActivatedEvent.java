package achanvear.peru.payments.domain.event;

import achanvear.peru.payments.domain.model.PlanType;
import achanvear.peru.shared.domain.DomainEvent;

import java.time.Instant;
import java.util.UUID;

public record SubscriptionActivatedEvent(
        UUID subscriptionId,
        UUID companyUserId,
        PlanType plan,
        Instant startDate,
        Instant endDate,
        Instant occurredAt
) implements DomainEvent {

    public SubscriptionActivatedEvent {
        if (occurredAt == null) {
            occurredAt = Instant.now();
        }
    }

    public SubscriptionActivatedEvent(
            UUID subscriptionId,
            UUID companyUserId,
            PlanType plan,
            Instant startDate,
            Instant endDate
    ) {
        this(subscriptionId, companyUserId, plan, startDate, endDate, Instant.now());
    }

    @Override
    public Instant occurredAt() {
        return occurredAt;
    }
}
