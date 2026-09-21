package achanvear.peru.identity.application.command;

public record RegisterUserCommand(
        String email,
        String fullName,
        String dni,
        String phone,
        String rawPassword,
        String role,
        String representanteDni,
        String representanteLegal,
        String ruc,
        boolean acceptTerms,
        boolean acceptPrivacy,
        String termsVersion,
        String privacyVersion
) {
}
