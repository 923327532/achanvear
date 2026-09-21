package achanvear.peru.identity.application.command;

/**
 * Command to reset password using token.
 */
public record ResetPasswordCommand(String token, String newPassword) {
}
