package achanvear.peru.jobs.domain.model;

import achanvear.peru.shared.domain.ValueObject;

import java.util.Objects;
import java.util.UUID;

public record JobPostId(UUID value) implements ValueObject {

    public JobPostId {
        Objects.requireNonNull(value, "Job post id cannot be null");
    }

    public static JobPostId generate() {
        return new JobPostId(UUID.randomUUID());
    }

    public static JobPostId from(String value) {
        return new JobPostId(UUID.fromString(value));
    }

    @Override
    public String toString() {
        return value.toString();
    }
}