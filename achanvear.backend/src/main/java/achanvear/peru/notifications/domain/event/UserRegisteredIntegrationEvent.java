package achanvear.peru.notifications.domain.event;

import java.time.Instant;
import java.util.Objects;

public record UserRegisteredIntegrationEvent(
        String userId,
        String email,
        Instant occurredAt
) {

    public UserRegisteredIntegrationEvent {
        Objects.requireNonNull(userId, "User id cannot be null");
        Objects.requireNonNull(email, "Email cannot be null");
        Objects.requireNonNull(occurredAt, "Occurred at cannot be null");
    }

    public static UserRegisteredIntegrationEvent from(String userId, String email) {
        return new UserRegisteredIntegrationEvent(userId, email, Instant.now());
    }
}
