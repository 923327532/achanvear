package achanvear.peru.freelance.domain.model;

import achanvear.peru.shared.domain.ValueObject;

import java.util.Objects;
import java.util.UUID;

public record FreelancerId(UUID value) implements ValueObject {

    public FreelancerId {
        Objects.requireNonNull(value, "Freelancer id cannot be null");
    }

    public static FreelancerId generate() {
        return new FreelancerId(UUID.randomUUID());
    }

    public static FreelancerId from(String value) {
        return new FreelancerId(UUID.fromString(value));
    }

    @Override
    public String toString() {
        return value.toString();
    }
}