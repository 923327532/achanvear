package achanvear.peru.identity.application.command;

/**
 * Command to initiate password reset process.
 */
public record ForgotPasswordCommand(String email) {
}
