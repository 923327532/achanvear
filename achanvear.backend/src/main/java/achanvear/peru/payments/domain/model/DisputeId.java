package achanvear.peru.payments.domain.model;

import java.util.UUID;

public record DisputeId(UUID value) {
    public DisputeId {
        if (value == null) {
            throw new IllegalArgumentException("DisputeId value must not be null");
        }
    }
}
