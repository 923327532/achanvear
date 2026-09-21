package achanvear.peru.profile.application.port.out;

public interface ProfileValidationPort {

    ValidationResult validateProfile(String profileId);

    record ValidationResult(
            boolean valid,
            String message
    ) {
    }
}