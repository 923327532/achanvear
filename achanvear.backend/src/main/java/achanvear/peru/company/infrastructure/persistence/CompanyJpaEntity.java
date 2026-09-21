package achanvear.peru.company.infrastructure.persistence;

import achanvear.peru.shared.infrastructure.BaseJpaEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "companies")
public class CompanyJpaEntity extends BaseJpaEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "owner_user_id", nullable = false, unique = true)
    private UUID ownerUserId;

    @Column(name = "business_name", nullable = false, unique = true, length = 150)
    private String businessName;

    @Column(name = "trade_name", length = 150)
    private String tradeName;

    @Column(name = "legal_name", nullable = false, length = 180)
    private String legalName;

    @Column(name = "industry", nullable = false, length = 120)
    private String industry;

    @Column(name = "specialty", nullable = false, length = 120)
    private String specialty;

    @Column(name = "company_size", nullable = false, length = 40)
    private String companySize;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "biography", nullable = false, length = 1500)
    private String biography;

    @Column(name = "achievements", length = 1500)
    private String achievements;

    @Column(name = "address", nullable = false, length = 255)
    private String address;

    @Column(name = "payment_method_type", nullable = false, length = 40)
    private String paymentMethodType;

    @Column(name = "company_plan", nullable = false, length = 40)
    private String companyPlan;

    @Column(name = "representative_dni", nullable = false, length = 8)
    private String representativeDni;

    @Column(name = "ruc", length = 11)
    private String ruc;

    @Column(name = "status", nullable = false, length = 30)
    private String status;

    public CompanyJpaEntity() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getOwnerUserId() {
        return ownerUserId;
    }

    public void setOwnerUserId(UUID ownerUserId) {
        this.ownerUserId = ownerUserId;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getTradeName() {
        return tradeName;
    }

    public void setTradeName(String tradeName) {
        this.tradeName = tradeName;
    }

    public String getLegalName() {
        return legalName;
    }

    public void setLegalName(String legalName) {
        this.legalName = legalName;
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

    public String getCompanySize() {
        return companySize;
    }

    public void setCompanySize(String companySize) {
        this.companySize = companySize;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
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

    public String getPaymentMethodType() {
        return paymentMethodType;
    }

    public void setPaymentMethodType(String paymentMethodType) {
        this.paymentMethodType = paymentMethodType;
    }

    public String getCompanyPlan() {
        return companyPlan;
    }

    public void setCompanyPlan(String companyPlan) {
        this.companyPlan = companyPlan;
    }

    public String getRepresentativeDni() {
        return representativeDni;
    }

    public void setRepresentativeDni(String representativeDni) {
        this.representativeDni = representativeDni;
    }

    public String getRuc() {
        return ruc;
    }

    public void setRuc(String ruc) {
        this.ruc = ruc;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}