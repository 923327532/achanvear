package achanvear.peru.payments.domain.model;

import java.util.UUID;

public record EscrowId(UUID value) {
    public EscrowId {
        if (value == null) {
            throw new IllegalArgumentException("EscrowId value must not be null");
        }
    }
}
