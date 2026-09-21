package achanvear.peru.identity.domain.event;

import achanvear.peru.identity.domain.model.Email;
import achanvear.peru.identity.domain.model.UserId;
import achanvear.peru.identity.domain.model.UserRole;
import achanvear.peru.shared.domain.DomainEvent;

import java.time.Instant;
import java.util.Objects;

public record UserRegisteredEvent(
        UserId userId,
        Email email,
        String fullName,
        String dni,
        String phone,
        UserRole role,
        Instant occurredAt
) implements DomainEvent {

    public UserRegisteredEvent {
        Objects.requireNonNull(userId, "User id cannot be null");
        Objects.requireNonNull(email, "Email cannot be null");
        Objects.requireNonNull(role, "Role cannot be null");
        Objects.requireNonNull(occurredAt, "Occurred at cannot be null");
    }

    public static UserRegisteredEvent now(UserId userId, Email email, String fullName, String dni, String phone, UserRole role) {
        return new UserRegisteredEvent(userId, email, fullName, dni, phone, role, Instant.now());
    }
}
