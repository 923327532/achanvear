package achanvear.peru.payments.domain.model;

import achanvear.peru.shared.domain.ValueObject;

import java.util.UUID;

public record LocalPaymentMethodId(UUID value) implements ValueObject {
    public LocalPaymentMethodId {
        if (value == null) {
            throw new IllegalArgumentException("LocalPaymentMethodId must not be null");
        }
    }
}
