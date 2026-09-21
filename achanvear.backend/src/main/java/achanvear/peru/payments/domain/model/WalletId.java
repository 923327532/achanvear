package achanvear.peru.payments.domain.model;

import achanvear.peru.shared.domain.ValueObject;

import java.util.UUID;

public record WalletId(UUID value) implements ValueObject {
    public WalletId {
        if (value == null) {
            throw new IllegalArgumentException("WalletId must not be null");
        }
    }
}
