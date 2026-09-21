package achanvear.peru.company.domain.model;

import achanvear.peru.company.domain.event.CompanyCreatedEvent;
import achanvear.peru.company.domain.event.CompanyDeactivatedEvent;
import achanvear.peru.company.domain.event.CompanyStatusChangedEvent;
import achanvear.peru.company.domain.event.CompanyUpdatedEvent;
import achanvear.peru.shared.domain.AggregateRoot;

import java.util.Objects;
import java.util.UUID;

public class Company extends AggregateRoot<CompanyId> {

    private final CompanyId id;
    private final UUID ownerUserId;
    private String businessName;
    private String tradeName;
    private String legalName;
    private String industry;
    private String specialty;
    private CompanySize companySize;
    private String logoUrl;
    private String biography;
    private String achievements;
    private String address;
    private PaymentMethodType paymentMethodType;
    private CompanyPlan companyPlan;
    private RepresentativeDni representativeDni;
    private Ruc ruc;
    private CompanyStatus status;

    private Company(
            CompanyId id,
            UUID ownerUserId,
            String businessName,
            String tradeName,
            String legalName,
            String industry,
            String specialty,
            CompanySize companySize,
            String logoUrl,
            String biography,
            String achievements,
            String address,
            PaymentMethodType paymentMethodType,
            CompanyPlan companyPlan,
            RepresentativeDni representativeDni,
            Ruc ruc,
            CompanyStatus status
    ) {
        this.id = Objects.requireNonNull(id, "Company id cannot be null");
        this.ownerUserId = Objects.requireNonNull(ownerUserId, "Owner user id cannot be null");
        this.businessName = validateRequiredText(businessName, "Business name", 3, 150);
        this.tradeName = normalizeOptionalText(tradeName);
        this.legalName = validateRequiredText(legalName, "Legal name", 3, 180);
        this.industry = validateRequiredText(industry, "Industry", 2, 120);
        this.specialty = validateRequiredText(specialty, "Specialty", 2, 120);
        this.companySize = Objects.requireNonNull(companySize, "Company size cannot be null");
        this.logoUrl = normalizeOptionalText(logoUrl);
        this.biography = validateRequiredText(biography, "Biography", 10, 1500);
        this.achievements = normalizeOptionalText(achievements);
        this.address = validateRequiredText(address, "Address", 5, 255);
        this.paymentMethodType = Objects.requireNonNull(paymentMethodType, "Payment method type cannot be null");
        this.companyPlan = Objects.requireNonNull(companyPlan, "Company plan cannot be null");
        this.representativeDni = Objects.requireNonNull(representativeDni, "Representative dni cannot be null");
        this.ruc = ruc;
        this.status = Objects.requireNonNull(status, "Company status cannot be null");
    }

    public static Company create(
            CompanyId id,
            UUID ownerUserId,
            String businessName,
            String tradeName,
            String legalName,
            String industry,
            String specialty,
            CompanySize companySize,
            String logoUrl,
            String biography,
            String achievements,
            String address,
            PaymentMethodType paymentMethodType,
            CompanyPlan companyPlan,
            RepresentativeDni representativeDni,
            Ruc ruc,
            CompanyStatus initialStatus
    ) {
        Company company = new Company(
                id,
                ownerUserId,
                businessName,
                tradeName,
                legalName,
                industry,
                specialty,
                companySize,
                logoUrl,
                biography,
                achievements,
                address,
                paymentMethodType,
                companyPlan,
                representativeDni,
                ruc,
                initialStatus
        );

        company.registerEvent(
                CompanyCreatedEvent.now(company.id, company.ownerUserId, company.businessName, company.status)
        );

        return company;
    }

    public static Company restore(
            CompanyId id,
            UUID ownerUserId,
            String businessName,
            String tradeName,
            String legalName,
            String industry,
            String specialty,
            CompanySize companySize,
            String logoUrl,
            String biography,
            String achievements,
            String address,
            PaymentMethodType paymentMethodType,
            CompanyPlan companyPlan,
            RepresentativeDni representativeDni,
            Ruc ruc,
            CompanyStatus status
    ) {
        return new Company(
                id,
                ownerUserId,
                businessName,
                tradeName,
                legalName,
                industry,
                specialty,
                companySize,
                logoUrl,
                biography,
                achievements,
                address,
                paymentMethodType,
                companyPlan,
                representativeDni,
                ruc,
                status
        );
    }

    public void updateProfile(
            String businessName,
            String tradeName,
            String legalName,
            String industry,
            String specialty,
            CompanySize companySize,
            String logoUrl,
            String biography,
            String achievements,
            String address,
            PaymentMethodType paymentMethodType,
            CompanyPlan companyPlan
    ) {
        ensureNotSuspended();

        this.businessName = validateRequiredText(businessName, "Business name", 3, 150);
        this.tradeName = normalizeOptionalText(tradeName);
        this.legalName = validateRequiredText(legalName, "Legal name", 3, 180);
        this.industry = validateRequiredText(industry, "Industry", 2, 120);
        this.specialty = validateRequiredText(specialty, "Specialty", 2, 120);
        this.companySize = Objects.requireNonNull(companySize, "Company size cannot be null");
        this.logoUrl = normalizeOptionalText(logoUrl);
        this.biography = validateRequiredText(biography, "Biography", 10, 1500);
        this.achievements = normalizeOptionalText(achievements);
        this.address = validateRequiredText(address, "Address", 5, 255);
        this.paymentMethodType = Objects.requireNonNull(paymentMethodType, "Payment method type cannot be null");
        this.companyPlan = Objects.requireNonNull(companyPlan, "Company plan cannot be null");

        registerEvent(CompanyUpdatedEvent.now(this.id, this.businessName));
    }

    public void changeStatus(CompanyStatus newStatus) {
        Objects.requireNonNull(newStatus, "New status cannot be null");

        if (this.status == newStatus) {
            throw new IllegalArgumentException("Company already has the requested status");
        }

        CompanyStatus previousStatus = this.status;
        this.status = newStatus;

        registerEvent(CompanyStatusChangedEvent.now(this.id, previousStatus, newStatus));
    }

    public void deactivate() {
        if (this.status == CompanyStatus.SUSPENDED) {
            throw new IllegalStateException("Company is already suspended");
        }

        this.status = CompanyStatus.SUSPENDED;
        registerEvent(CompanyDeactivatedEvent.now(this.id));
    }

    public boolean belongsTo(UUID userId) {
        return this.ownerUserId.equals(userId);
    }

    public boolean isValidated() {
        return this.status == CompanyStatus.VALIDATED;
    }

    public CompanyId getId() {
        return id;
    }

    public UUID getOwnerUserId() {
        return ownerUserId;
    }

    public String getBusinessName() {
        return businessName;
    }

    public String getTradeName() {
        return tradeName;
    }

    public String getLegalName() {
        return legalName;
    }

    public String getIndustry() {
        return industry;
    }

    public String getSpecialty() {
        return specialty;
    }

    public CompanySize getCompanySize() {
        return companySize;
    }

    public String getLogoUrl() {
        return logoUrl;
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

    public CompanyPlan getCompanyPlan() {
        return companyPlan;
    }

    public RepresentativeDni getRepresentativeDni() {
        return representativeDni;
    }

    public Ruc getRuc() {
        return ruc;
    }

    public CompanyStatus getStatus() {
        return status;
    }

    private void ensureNotSuspended() {
        if (this.status == CompanyStatus.SUSPENDED) {
            throw new IllegalStateException("Suspended companies cannot be updated");
        }
    }

    private String validateRequiredText(String value, String fieldName, int min, int max) {
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

    private String normalizeOptionalText(String value) {
        if (value == null) {
            return null;
        }

        String normalizedValue = value.trim();
        return normalizedValue.isBlank() ? null : normalizedValue;
    }
}