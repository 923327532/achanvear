package achanvear.peru.payments.domain.model;

import achanvear.peru.shared.domain.ValueObject;

import java.util.UUID;

public record PayoutId(UUID value) implements ValueObject {
    public PayoutId {
        if (value == null) {
            throw new IllegalArgumentException("PayoutId must not be null");
        }
    }
}
