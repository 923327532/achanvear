package achanvear.peru.freelance.domain.model;

import achanvear.peru.shared.domain.AggregateRoot;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

public class FreelancerProfile extends AggregateRoot<FreelancerId> {

    private final FreelancerId id;
    private final UUID userId;
    private String name;
    private String industry;
    private String specialty;
    private String profilePhotoUrl;
    private String biography;
    private String achievements;
    private String address;
    private PaymentMethodType paymentMethodType;
    private String dni;
    private String curriculumUrl;
    private String cvData;
    private FreelancerStatus status;

    private final List<FreelancerCertification> certifications;

    // ── Nuevos campos para Configuración (2.1 a 2.4) ──
    private AvailabilityStatus availabilityStatus;
    private CvVisibility cvVisibility;
    private PreferredCurrency preferredCurrency;
    private PreferredPaymentMethod preferredPaymentMethod;
    private String language;
    private String timezone;
    private String notificationPreferences;

    private FreelancerProfile(
            FreelancerId id,
            UUID userId,
            String name,
            String industry,
            String specialty,
            String profilePhotoUrl,
            String biography,
            String achievements,
            String address,
            PaymentMethodType paymentMethodType,
            String dni,
            String curriculumUrl,
            String cvData,
            FreelancerStatus status,
            List<FreelancerCertification> certifications,
            AvailabilityStatus availabilityStatus,
            CvVisibility cvVisibility,
            PreferredCurrency preferredCurrency,
            PreferredPaymentMethod preferredPaymentMethod,
            String language,
            String timezone,
            String notificationPreferences
    ) {
        this.id = Objects.requireNonNull(id, "Freelancer id cannot be null");
        this.userId = Objects.requireNonNull(userId, "User id cannot be null");
        this.name = validateRequiredText(name, "Name", 3, 150);
        this.industry = validateRequiredText(industry, "Industry", 3, 120);
        this.specialty = validateRequiredText(specialty, "Specialty", 3, 120);
        this.profilePhotoUrl = normalizeOptionalText(profilePhotoUrl);
        this.biography = validateRequiredText(biography, "Biography", 20, 2000);
        this.achievements = normalizeOptionalText(achievements);
        this.address = normalizeOptionalText(address);
        this.paymentMethodType = Objects.requireNonNull(paymentMethodType, "Payment method type cannot be null");
        this.dni = validateDni(dni);
        this.curriculumUrl = normalizeOptionalText(curriculumUrl);
        this.cvData = normalizeOptionalText(cvData);
        this.status = Objects.requireNonNull(status, "Freelancer status cannot be null");
        this.certifications = new ArrayList<>(Objects.requireNonNull(certifications, "Certifications cannot be null"));
        this.availabilityStatus = availabilityStatus;
        this.cvVisibility = cvVisibility;
        this.preferredCurrency = preferredCurrency;
        this.preferredPaymentMethod = preferredPaymentMethod;
        this.language = language;
        this.timezone = timezone;
        this.notificationPreferences = notificationPreferences;
    }


    public static FreelancerProfile create(
            UUID userId,
            String name,
            String industry,
            String specialty,
            String profilePhotoUrl,
            String biography,
            String achievements,
            String address,
            PaymentMethodType paymentMethodType,
            String dni,
            String curriculumUrl,
            List<FreelancerCertification> certifications
    ) {
        return new FreelancerProfile(
                FreelancerId.generate(),
                userId,
                name,
                industry,
                specialty,
                profilePhotoUrl,
                biography,
                achievements,
                address,
                paymentMethodType,
                dni,
                curriculumUrl,
                null, // cvData
                FreelancerStatus.PENDING_VALIDATION,
                certifications,
                null, // availabilityStatus
                null, // cvVisibility
                null, // preferredCurrency
                null, // preferredPaymentMethod
                null, // language
                null, // timezone
                null  // notificationPreferences
        );
    }

    public static FreelancerProfile restore(
            FreelancerId id,
            UUID userId,
            String name,
            String industry,
            String specialty,
            String profilePhotoUrl,
            String biography,
            String achievements,
            String address,
            PaymentMethodType paymentMethodType,
            String dni,
            String curriculumUrl,
            String cvData,
            FreelancerStatus status,
            List<FreelancerCertification> certifications,
            AvailabilityStatus availabilityStatus,
            CvVisibility cvVisibility,
            PreferredCurrency preferredCurrency,
            PreferredPaymentMethod preferredPaymentMethod,
            String language,
            String timezone,
            String notificationPreferences
    ) {
        return new FreelancerProfile(
                id,
                userId,
                name,
                industry,
                specialty,
                profilePhotoUrl,
                biography,
                achievements,
                address,
                paymentMethodType,
                dni,
                curriculumUrl,
                cvData,
                status,
                certifications,
                availabilityStatus,
                cvVisibility,
                preferredCurrency,
                preferredPaymentMethod,
                language,
                timezone,
                notificationPreferences
        );
    }


    public void validateIdentity() {
        if (this.status == FreelancerStatus.ACTIVE) {
            throw new IllegalStateException("Freelancer profile is already active");
        }

        this.status = FreelancerStatus.ACTIVE;
    }

    public void suspend() {
        if (this.status == FreelancerStatus.SUSPENDED) {
            throw new IllegalStateException("Freelancer profile is already suspended");
        }

        this.status = FreelancerStatus.SUSPENDED;
    }

    public void updateProfile(
            String name,
            String industry,
            String specialty,
            String profilePhotoUrl,
            String biography,
            String achievements,
            String address,
            PaymentMethodType paymentMethodType,
            String dni,
            String curriculumUrl,
            String cvData,
            List<FreelancerCertification> certifications
    ) {
        updateProfile(name, industry, specialty, profilePhotoUrl, biography, achievements, address,
                paymentMethodType, dni, curriculumUrl, cvData, certifications,
                this.availabilityStatus, this.cvVisibility, this.preferredCurrency,
                this.preferredPaymentMethod, this.language, this.timezone,
                this.notificationPreferences);
    }

    public void updateProfile(
            String name,
            String industry,
            String specialty,
            String profilePhotoUrl,
            String biography,
            String achievements,
            String address,
            PaymentMethodType paymentMethodType,
            String dni,
            String curriculumUrl,
            String cvData,
            List<FreelancerCertification> certifications,
            AvailabilityStatus availabilityStatus,
            CvVisibility cvVisibility,
            PreferredCurrency preferredCurrency,
            PreferredPaymentMethod preferredPaymentMethod,
            String language,
            String timezone,
            String notificationPreferences
    ) {
        this.name = validateRequiredText(name, "Name", 3, 150);
        this.industry = validateRequiredText(industry, "Industry", 3, 120);
        this.specialty = validateRequiredText(specialty, "Specialty", 3, 120);
        this.profilePhotoUrl = normalizeOptionalText(profilePhotoUrl);
        this.biography = validateRequiredText(biography, "Biography", 20, 2000);
        this.achievements = normalizeOptionalText(achievements);
        this.address = normalizeOptionalText(address);
        this.paymentMethodType = Objects.requireNonNull(paymentMethodType, "Payment method type cannot be null");
        this.dni = validateDni(dni);
        this.curriculumUrl = normalizeOptionalText(curriculumUrl);
        this.cvData = normalizeOptionalText(cvData);
        this.certifications.clear();
        this.certifications.addAll(Objects.requireNonNull(certifications, "Certifications cannot be null"));
        this.availabilityStatus = availabilityStatus;
        this.cvVisibility = cvVisibility;
        this.preferredCurrency = preferredCurrency;
        this.preferredPaymentMethod = preferredPaymentMethod;
        this.language = language;
        this.timezone = timezone;
        this.notificationPreferences = notificationPreferences;
    }


    public FreelancerId getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getIndustry() {
        return industry;
    }

    public String getSpecialty() {
        return specialty;
    }

    public String getProfilePhotoUrl() {
        return profilePhotoUrl;
    }

    public String getBiography() {
        return biography;
    }

    public String getAchievements() {
        return achievements;
    }

    public String getAddress() {
        return address;
    }

    public PaymentMethodType getPaymentMethodType() {
        return paymentMethodType;
    }

    public String getDni() {
        return dni;
    }

    public String getCurriculumUrl() {
        return curriculumUrl;
    }

    public String getCvData() {
        return cvData;
    }

    public void setCvData(String cvData) {
        this.cvData = normalizeOptionalText(cvData);
    }

    public FreelancerStatus getStatus() {

        return status;
    }

    public List<FreelancerCertification> getCertifications() {
        return List.copyOf(certifications);
    }

    public AvailabilityStatus getAvailabilityStatus() {
        return availabilityStatus;
    }

    public CvVisibility getCvVisibility() {
        return cvVisibility;
    }

    public PreferredCurrency getPreferredCurrency() {
        return preferredCurrency;
    }

    public PreferredPaymentMethod getPreferredPaymentMethod() {
        return preferredPaymentMethod;
    }

    public String getLanguage() {
        return language;
    }

    public String getTimezone() {
        return timezone;
    }

    public String getNotificationPreferences() {
        return notificationPreferences;
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

    private static String validateDni(String value) {
        Objects.requireNonNull(value, "Dni cannot be null");

        String normalizedValue = value.trim();
        if (!normalizedValue.matches("\\d{8}")) {
            throw new IllegalArgumentException("Dni must contain exactly 8 digits");
        }

        return normalizedValue;
    }
}