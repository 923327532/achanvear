package achanvear.peru.payments.domain.model;

import java.util.UUID;

public record MilestoneId(UUID value) {
    public MilestoneId {
        if (value == null) {
            throw new IllegalArgumentException("MilestoneId cannot be null");
        }
    }
}
