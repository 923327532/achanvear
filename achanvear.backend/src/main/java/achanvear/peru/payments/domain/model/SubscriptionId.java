package achanvear.peru.payments.domain.model;

import java.util.UUID;

public record SubscriptionId(UUID value) {
    public SubscriptionId {
        if (value == null) {
            throw new IllegalArgumentException("Subscription ID cannot be null");
        }
    }
}