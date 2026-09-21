package achanvear.peru.identity.application.dto;

import java.time.Instant;

/**
 * Response containing password reset token information.
 * For manual flow, token is included. For email flow, only expiration is sent.
 */
public record PasswordResetResponse(
        String message,
        String token,
        Instant expiresAt,
        boolean manualMode
) {
    public static PasswordResetResponse manual(String token, Instant expiresAt) {
        return new PasswordResetResponse(
                "Password reset token generated successfully",
                token,
                expiresAt,
                true
        );
    }

    public static PasswordResetResponse email(Instant expiresAt) {
        return new PasswordResetResponse(
                "Password reset instructions sent to your email",
                null,
                expiresAt,
                false
        );
    }
}
