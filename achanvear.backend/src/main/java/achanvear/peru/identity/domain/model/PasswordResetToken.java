package achanvear.peru.identity.domain.model;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * Domain entity representing a password reset token.
 * Tokens are single-use and have an expiration time.
 */
public class PasswordResetToken {

    private final String token;
    private final UserId userId;
    private final Instant expiresAt;
    private boolean used;

    private PasswordResetToken(String token, UserId userId, Instant expiresAt, boolean used) {
        this.token = Objects.requireNonNull(token, "Token cannot be null");
        this.userId = Objects.requireNonNull(userId, "UserId cannot be null");
        this.expiresAt = Objects.requireNonNull(expiresAt, "Expiration time cannot be null");
        this.used = used;
    }

    public static PasswordResetToken create(UserId userId, long expirationMinutes) {
        String token = UUID.randomUUID().toString();
        Instant expiresAt = Instant.now().plusSeconds(expirationMinutes * 60);
        return new PasswordResetToken(token, userId, expiresAt, false);
    }

    public static PasswordResetToken restore(String token, UserId userId, Instant expiresAt, boolean used) {
        return new PasswordResetToken(token, userId, expiresAt, used);
    }

    public boolean isValid() {
        return !used && Instant.now().isBefore(expiresAt);
    }

    public void markAsUsed() {
        this.used = true;
    }

    public String getToken() {
        return token;
    }

    public UserId getUserId() {
        return userId;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public boolean isUsed() {
        return used;
    }
}
