package achanvear.peru.freelance.domain.model;

import achanvear.peru.shared.domain.ValueObject;

import java.util.Objects;
import java.util.UUID;

public record FreelanceProjectId(UUID value) implements ValueObject {

    public FreelanceProjectId {
        Objects.requireNonNull(value, "Freelance project id cannot be null");
    }

    public static FreelanceProjectId generate() {
        return new FreelanceProjectId(UUID.randomUUID());
    }

    public static FreelanceProjectId from(String value) {
        return new FreelanceProjectId(UUID.fromString(value));
    }

    @Override
    public String toString() {
        return value.toString();
    }
}