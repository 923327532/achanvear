package achanvear.peru.freelance.domain.model;

import achanvear.peru.shared.domain.ValueObject;

import java.util.Objects;
import java.util.UUID;

public record MilestoneId(UUID value) implements ValueObject {

    public MilestoneId {
        Objects.requireNonNull(value, "Milestone id cannot be null");
    }

    public static MilestoneId generate() {
        return new MilestoneId(UUID.randomUUID());
    }

    @Override
    public String toString() {
        return value.toString();
    }
}