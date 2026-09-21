package achanvear.peru.payments.domain.model;

import achanvear.peru.shared.domain.ValueObject;

import java.util.UUID;

public record WalletTransactionId(UUID value) implements ValueObject {
    public WalletTransactionId {
        if (value == null) {
            throw new IllegalArgumentException("WalletTransactionId must not be null");
        }
    }
}
