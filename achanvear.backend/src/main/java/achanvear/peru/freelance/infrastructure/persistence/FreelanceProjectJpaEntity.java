package achanvear.peru.freelance.infrastructure.persistence;

import achanvear.peru.freelance.domain.model.ProjectStatus;
import achanvear.peru.shared.infrastructure.BaseJpaEntity;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "freelance_projects")
public class FreelanceProjectJpaEntity extends BaseJpaEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "client_user_id", nullable = false)
    private UUID clientUserId;

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "description", nullable = false, length = 5000)
    private String description;

    @Column(name = "category", nullable = false, length = 120)
    private String category;

    @Column(name = "subcategory", length = 120)
    private String subcategory;

    @Column(name = "budget", nullable = false, precision = 12, scale = 2)
    private BigDecimal budget;

    @Column(name = "estimated_days", nullable = false)
    private Integer estimatedDays;

    @Column(name = "experience_level", length = 50)
    private String experienceLevel;

    @Column(name = "skills", columnDefinition = "TEXT")
    private String skills;

    @Column(name = "budget_type", length = 30)
    private String budgetType;

    @Column(name = "modality", length = 30)
    private String modality;

    @Column(name = "provider_type", length = 30)
    private String providerType;

    @Column(name = "attachments", columnDefinition = "TEXT")
    private String attachments;

    @Column(name = "currency", length = 10)
    private String currency;

    @Column(name = "language", length = 50)
    private String language;

    @Column(name = "min_budget", precision = 12, scale = 2)
    private BigDecimal minBudget;

    @Column(name = "max_budget", precision = 12, scale = 2)
    private BigDecimal maxBudget;

    @Column(name = "hourly_rate_min", precision = 12, scale = 2)
    private BigDecimal hourlyRateMin;

    @Column(name = "hourly_rate_max", precision = 12, scale = 2)
    private BigDecimal hourlyRateMax;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private ProjectStatus status;

    @Column(name = "selected_freelancer_user_id")
    private UUID selectedFreelancerUserId;

    @OneToMany(
            mappedBy = "project",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private List<ProposalJpaEntity> proposals = new ArrayList<>();

    @OneToMany(
            mappedBy = "project",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private List<MilestoneJpaEntity> milestones = new ArrayList<>();

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getClientUserId() {
        return clientUserId;
    }

    public void setClientUserId(UUID clientUserId) {
        this.clientUserId = clientUserId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getSubcategory() {
        return subcategory;
    }

    public void setSubcategory(String subcategory) {
        this.subcategory = subcategory;
    }

    public BigDecimal getBudget() {
        return budget;
    }

    public void setBudget(BigDecimal budget) {
        this.budget = budget;
    }

    public Integer getEstimatedDays() {
        return estimatedDays;
    }

    public void setEstimatedDays(Integer estimatedDays) {
        this.estimatedDays = estimatedDays;
    }

    public String getExperienceLevel() {
        return experienceLevel;
    }

    public void setExperienceLevel(String experienceLevel) {
        this.experienceLevel = experienceLevel;
    }

    public String getSkills() {
        return skills;
    }

    public void setSkills(String skills) {
        this.skills = skills;
    }

    public String getBudgetType() {
        return budgetType;
    }

    public void setBudgetType(String budgetType) {
        this.budgetType = budgetType;
    }

    public String getModality() {
        return modality;
    }

    public void setModality(String modality) {
        this.modality = modality;
    }

    public String getProviderType() {
        return providerType;
    }

    public void setProviderType(String providerType) {
        this.providerType = providerType;
    }

    public String getAttachments() {
        return attachments;
    }

    public void setAttachments(String attachments) {
        this.attachments = attachments;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public BigDecimal getMinBudget() {
        return minBudget;
    }

    public void setMinBudget(BigDecimal minBudget) {
        this.minBudget = minBudget;
    }

    public BigDecimal getMaxBudget() {
        return maxBudget;
    }

    public void setMaxBudget(BigDecimal maxBudget) {
        this.maxBudget = maxBudget;
    }

    public BigDecimal getHourlyRateMin() {
        return hourlyRateMin;
    }

    public void setHourlyRateMin(BigDecimal hourlyRateMin) {
        this.hourlyRateMin = hourlyRateMin;
    }

    public BigDecimal getHourlyRateMax() {
        return hourlyRateMax;
    }

    public void setHourlyRateMax(BigDecimal hourlyRateMax) {
        this.hourlyRateMax = hourlyRateMax;
    }

    public ProjectStatus getStatus() {
        return status;
    }

    public void setStatus(ProjectStatus status) {
        this.status = status;
    }

    public UUID getSelectedFreelancerUserId() {
        return selectedFreelancerUserId;
    }

    public void setSelectedFreelancerUserId(UUID selectedFreelancerUserId) {
        this.selectedFreelancerUserId = selectedFreelancerUserId;
    }

    public List<ProposalJpaEntity> getProposals() {
        return proposals;
    }

    public void setProposals(List<ProposalJpaEntity> proposals) {
        this.proposals = proposals;
    }

    public List<MilestoneJpaEntity> getMilestones() {
        return milestones;
    }

    public void setMilestones(List<MilestoneJpaEntity> milestones) {
        this.milestones = milestones;
    }
}