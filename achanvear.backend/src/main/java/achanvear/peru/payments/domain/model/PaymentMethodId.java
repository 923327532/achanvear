package achanvear.peru.payments.domain.model;

import java.util.UUID;

public record PaymentMethodId(UUID value) {
    public PaymentMethodId {
        if (value == null) {
            throw new IllegalArgumentException("PaymentMethodId value must not be null");
        }
    }
}
