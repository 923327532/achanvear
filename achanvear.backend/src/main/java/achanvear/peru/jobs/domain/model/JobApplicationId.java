package achanvear.peru.jobs.domain.model;

import achanvear.peru.shared.domain.ValueObject;

import java.util.Objects;
import java.util.UUID;

public record JobApplicationId(UUID value) implements ValueObject {

    public JobApplicationId {
        Objects.requireNonNull(value, "Job application id cannot be null");
    }

    public static JobApplicationId generate() {
        return new JobApplicationId(UUID.randomUUID());
    }

    public static JobApplicationId from(String value) {
        return new JobApplicationId(UUID.fromString(value));
    }

    @Override
    public String toString() {
        return value.toString();
    }
}
