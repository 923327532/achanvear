package achanvear.peru.payments.domain.model;

import achanvear.peru.shared.domain.ValueObject;

import java.util.UUID;

public record QuickRechargeId(UUID value) implements ValueObject {
    public QuickRechargeId {
        if (value == null) {
            throw new IllegalArgumentException("QuickRechargeId must not be null");
        }
    }
}
