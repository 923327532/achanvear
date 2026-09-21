package achanvear.peru.payments.domain.model;

import achanvear.peru.shared.domain.ValueObject;

import java.util.UUID;

public record PayoutMethodId(UUID value) implements ValueObject {
    public PayoutMethodId {
        if (value == null) {
            throw new IllegalArgumentException("PayoutMethodId must not be null");
        }
    }
}
