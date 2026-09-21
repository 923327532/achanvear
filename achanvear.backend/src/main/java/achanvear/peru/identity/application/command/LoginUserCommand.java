package achanvear.peru.identity.application.command;

public record LoginUserCommand(
        String email,
        String rawPassword
) {
}