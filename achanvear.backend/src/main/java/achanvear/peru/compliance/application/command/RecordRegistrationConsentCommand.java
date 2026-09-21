package achanvear.peru.compliance.application.command;

public record RecordRegistrationConsentCommand(
        String userId,
        boolean acceptTerms,
        boolean acceptPrivacy,
        String termsVersion,
        String privacyVersion
) {
}
