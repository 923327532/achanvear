package achanvear.peru.interview.domain.model;

import java.util.Objects;
import java.util.UUID;

public record InterviewId(UUID value) {

    public InterviewId {
        Objects.requireNonNull(value, "Interview id cannot be null");
    }

    public static InterviewId newId() {
        return new InterviewId(UUID.randomUUID());
    }

    public static InterviewId of(String value) {
        return new InterviewId(UUID.fromString(value));
    }

    @Override
    public String toString() {
        return value.toString();
    }
}