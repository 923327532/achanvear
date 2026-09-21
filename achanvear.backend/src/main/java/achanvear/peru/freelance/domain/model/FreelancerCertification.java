package achanvear.peru.freelance.domain.model;

import java.util.Objects;

public class FreelancerCertification {

    private final String name;
    private final String issuingOrganization;
    private final String credentialUrl;

    private FreelancerCertification(
            String name,
            String issuingOrganization,
            String credentialUrl
    ) {
        this.name = validateRequiredText(name, "Certification name", 3, 150);
        this.issuingOrganization = validateRequiredText(issuingOrganization, "Issuing organization", 2, 150);
        this.credentialUrl = normalizeOptionalText(credentialUrl);
    }

    public static FreelancerCertification create(
            String name,
            String issuingOrganization,
            String credentialUrl
    ) {
        return new FreelancerCertification(name, issuingOrganization, credentialUrl);
    }

    public String getName() {
        return name;
    }

    public String getIssuingOrganization() {
        return issuingOrganization;
    }

    public String getCredentialUrl() {
        return credentialUrl;
    }

    private static String validateRequiredText(String value, String fieldName, int min, int max) {
        Objects.requireNonNull(value, fieldName + " cannot be null");

        String normalizedValue = value.trim();
        if (normalizedValue.isBlank()) {
            throw new IllegalArgumentException(fieldName + " cannot be blank");
        }

        if (normalizedValue.length() < min || normalizedValue.length() > max) {
            throw new IllegalArgumentException(fieldName + " length must be between " + min + " and " + max + " characters");
        }

        return normalizedValue;
    }

    private static String normalizeOptionalText(String value) {
        if (value == null) {
            return null;
        }

        String normalizedValue = value.trim();
        return normalizedValue.isBlank() ? null : normalizedValue;
    }
}