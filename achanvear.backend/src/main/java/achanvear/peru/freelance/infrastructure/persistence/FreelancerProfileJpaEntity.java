package achanvear.peru.freelance.infrastructure.persistence;

import achanvear.peru.freelance.domain.model.*;
import achanvear.peru.shared.infrastructure.BaseJpaEntity;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "freelancer_profiles")
public class FreelancerProfileJpaEntity extends BaseJpaEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "industry", nullable = false, length = 120)
    private String industry;

    @Column(name = "specialty", nullable = false, length = 120)
    private String specialty;

    @Column(name = "profile_photo_url")
    private String profilePhotoUrl;

    @Column(name = "biography", nullable = false, length = 2000)
    private String biography;

    @Column(name = "achievements", length = 2000)
    private String achievements;

    @Column(name = "address", length = 255)
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method_type", nullable = false, length = 30)
    private PaymentMethodType paymentMethodType;

    @Column(name = "dni", nullable = false, unique = true, length = 8)
    private String dni;

    @Column(name = "curriculum_url")
    private String curriculumUrl;

    @Column(name = "cv_data", columnDefinition = "TEXT")
    private String cvData;


    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private FreelancerStatus status;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "freelancer_certifications",
            joinColumns = @JoinColumn(name = "freelancer_id")
    )
    private List<FreelancerCertificationEmbeddable> certifications = new ArrayList<>();

    // ── Nuevos campos para Configuración ──
    @Enumerated(EnumType.STRING)
    @Column(name = "availability_status", length = 30)
    private AvailabilityStatus availabilityStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "cv_visibility", length = 30)
    private CvVisibility cvVisibility;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_currency", length = 10)
    private PreferredCurrency preferredCurrency;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_payment_method", length = 20)
    private PreferredPaymentMethod preferredPaymentMethod;

    @Column(name = "language", length = 10)
    private String language;

    @Column(name = "timezone", length = 50)
    private String timezone;

    @Column(name = "notification_preferences", columnDefinition = "TEXT")
    private String notificationPreferences;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
    }

    public String getSpecialty() {
        return specialty;
    }

    public void setSpecialty(String specialty) {
        this.specialty = specialty;
    }

    public String getProfilePhotoUrl() {
        return profilePhotoUrl;
    }

    public void setProfilePhotoUrl(String profilePhotoUrl) {
        this.profilePhotoUrl = profilePhotoUrl;
    }

    public String getBiography() {
        return biography;
    }

    public void setBiography(String biography) {
        this.biography = biography;
    }

    public String getAchievements() {
        return achievements;
    }

    public void setAchievements(String achievements) {
        this.achievements = achievements;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public PaymentMethodType getPaymentMethodType() {
        return paymentMethodType;
    }

    public void setPaymentMethodType(PaymentMethodType paymentMethodType) {
        this.paymentMethodType = paymentMethodType;
    }

    public String getDni() {
        return dni;
    }

    public void setDni(String dni) {
        this.dni = dni;
    }

    public String getCurriculumUrl() {
        return curriculumUrl;
    }

    public void setCurriculumUrl(String curriculumUrl) {
        this.curriculumUrl = curriculumUrl;
    }

    public String getCvData() {
        return cvData;
    }

    public void setCvData(String cvData) {
        this.cvData = cvData;
    }

    public FreelancerStatus getStatus() {

        return status;
    }

    public void setStatus(FreelancerStatus status) {
        this.status = status;
    }

    public List<FreelancerCertificationEmbeddable> getCertifications() {
        return certifications;
    }

    public void setCertifications(List<FreelancerCertificationEmbeddable> certifications) {
        this.certifications = certifications;
    }

    public AvailabilityStatus getAvailabilityStatus() {
        return availabilityStatus;
    }

    public void setAvailabilityStatus(AvailabilityStatus availabilityStatus) {
        this.availabilityStatus = availabilityStatus;
    }

    public CvVisibility getCvVisibility() {
        return cvVisibility;
    }

    public void setCvVisibility(CvVisibility cvVisibility) {
        this.cvVisibility = cvVisibility;
    }

    public PreferredCurrency getPreferredCurrency() {
        return preferredCurrency;
    }

    public void setPreferredCurrency(PreferredCurrency preferredCurrency) {
        this.preferredCurrency = preferredCurrency;
    }

    public PreferredPaymentMethod getPreferredPaymentMethod() {
        return preferredPaymentMethod;
    }

    public void setPreferredPaymentMethod(PreferredPaymentMethod preferredPaymentMethod) {
        this.preferredPaymentMethod = preferredPaymentMethod;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public String getNotificationPreferences() {
        return notificationPreferences;
    }

    public void setNotificationPreferences(String notificationPreferences) {
        this.notificationPreferences = notificationPreferences;
    }
}
