package achanvear.peru.payments.domain.event;

import achanvear.peru.shared.domain.DomainEvent;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record MilestoneFundedEvent(
        UUID milestoneId,
        UUID projectId,
        UUID clientUserId,
        UUID freelancerUserId,
        BigDecimal amount,
        Instant occurredAt
) implements DomainEvent {

    public MilestoneFundedEvent {
        if (occurredAt == null) {
            occurredAt = Instant.now();
        }
    }

    public MilestoneFundedEvent(
            UUID milestoneId,
            UUID projectId,
            UUID clientUserId,
            UUID freelancerUserId,
            BigDecimal amount
    ) {
        this(milestoneId, projectId, clientUserId, freelancerUserId, amount, Instant.now());
    }

    @Override
    public Instant occurredAt() {
        return occurredAt;
    }
}
