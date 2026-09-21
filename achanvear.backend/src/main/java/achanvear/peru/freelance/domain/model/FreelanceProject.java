package achanvear.peru.freelance.domain.model;

import achanvear.peru.freelance.domain.event.ProposalSubmittedEvent;
import achanvear.peru.shared.domain.AggregateRoot;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

public class FreelanceProject extends AggregateRoot<FreelanceProjectId> {

    private final FreelanceProjectId id;
    private final UUID clientUserId;
    private String title;
    private String description;
    private String category;
    private String subcategory;
    private BigDecimal budget;
    private Integer estimatedDays;
    private String experienceLevel;
    private List<String> skills;
    private String budgetType;
    private String modality;
    private String providerType;
    private List<String> attachments;
    private ProjectStatus status;
    private UUID selectedFreelancerUserId;
    private final List<Proposal> proposals;
    private final List<Milestone> milestones;
    private Instant createdAt;
    // ── Nuevos campos ──
    private String currency;
    private String language;
    private BigDecimal minBudget;
    private BigDecimal maxBudget;
    private BigDecimal hourlyRateMin;
    private BigDecimal hourlyRateMax;

    private FreelanceProject(
            FreelanceProjectId id,
            UUID clientUserId,
            String title,
            String description,
            String category,
            String subcategory,
            BigDecimal budget,
            Integer estimatedDays,
            String experienceLevel,
            List<String> skills,
            String budgetType,
            String modality,
            String providerType,
            List<String> attachments,
            ProjectStatus status,
            UUID selectedFreelancerUserId,
            List<Proposal> proposals,
            List<Milestone> milestones,
            Instant createdAt,
            // ── Nuevos parámetros ──
            String currency,
            String language,
            BigDecimal minBudget,
            BigDecimal maxBudget,
            BigDecimal hourlyRateMin,
            BigDecimal hourlyRateMax
    ) {
        this.id = Objects.requireNonNull(id, "Freelance project id cannot be null");
        this.clientUserId = Objects.requireNonNull(clientUserId, "Client user id cannot be null");
        this.title = validateRequiredText(title, "Title", 5, 150);
        this.description = validateRequiredText(description, "Description", 20, 5000);
        this.category = validateRequiredText(category, "Category", 3, 120);
        this.subcategory = subcategory;
        this.budget = budget != null ? validateAmount(budget, "Budget") : null;
        this.estimatedDays = validatePositive(estimatedDays, "Estimated days");
        this.experienceLevel = experienceLevel;
        this.skills = skills != null ? new ArrayList<>(skills) : new ArrayList<>();
        this.budgetType = budgetType;
        this.modality = modality;
        this.providerType = providerType;
        this.attachments = attachments != null ? new ArrayList<>(attachments) : new ArrayList<>();
        this.status = Objects.requireNonNull(status, "Project status cannot be null");
        this.selectedFreelancerUserId = selectedFreelancerUserId;
        this.proposals = new ArrayList<>(Objects.requireNonNull(proposals, "Proposals cannot be null"));
        this.milestones = new ArrayList<>(Objects.requireNonNull(milestones, "Milestones cannot be null"));
        this.createdAt = createdAt;
        this.currency = currency;
        this.language = language;
        this.minBudget = minBudget;
        this.maxBudget = maxBudget;
        this.hourlyRateMin = hourlyRateMin;
        this.hourlyRateMax = hourlyRateMax;
    }

    public static FreelanceProject create(
            UUID clientUserId,
            String title,
            String description,
            String category,
            String subcategory,
            BigDecimal budget,
            Integer estimatedDays,
            String experienceLevel,
            List<String> skills,
            String budgetType,
            String modality,
            String providerType,
            List<String> attachments,
            // ── Nuevos parámetros ──
            String currency,
            String language,
            BigDecimal minBudget,
            BigDecimal maxBudget,
            BigDecimal hourlyRateMin,
            BigDecimal hourlyRateMax
    ) {
        return new FreelanceProject(
                FreelanceProjectId.generate(),
                clientUserId,
                title,
                description,
                category,
                subcategory,
                budget,
                estimatedDays,
                experienceLevel,
                skills,
                budgetType,
                modality,
                providerType,
                attachments,
                ProjectStatus.OPEN,
                null,
                new ArrayList<>(),
                new ArrayList<>(),
                Instant.now(),
                currency,
                language,
                minBudget,
                maxBudget,
                hourlyRateMin,
                hourlyRateMax
        );
    }

    public static FreelanceProject restore(
            FreelanceProjectId id,
            UUID clientUserId,
            String title,
            String description,
            String category,
            String subcategory,
            BigDecimal budget,
            Integer estimatedDays,
            String experienceLevel,
            List<String> skills,
            String budgetType,
            String modality,
            String providerType,
            List<String> attachments,
            ProjectStatus status,
            UUID selectedFreelancerUserId,
            List<Proposal> proposals,
            List<Milestone> milestones,
            Instant createdAt,
            // ── Nuevos parámetros ──
            String currency,
            String language,
            BigDecimal minBudget,
            BigDecimal maxBudget,
            BigDecimal hourlyRateMin,
            BigDecimal hourlyRateMax
    ) {
        return new FreelanceProject(
                id,
                clientUserId,
                title,
                description,
                category,
                subcategory,
                budget,
                estimatedDays,
                experienceLevel,
                skills,
                budgetType,
                modality,
                providerType,
                attachments,
                status,
                selectedFreelancerUserId,
                proposals,
                milestones,
                createdAt,
                currency,
                language,
                minBudget,
                maxBudget,
                hourlyRateMin,
                hourlyRateMax
        );
    }

    public void update(
            String title,
            String description,
            String category,
            String subcategory,
            BigDecimal budget,
            Integer estimatedDays,
            String experienceLevel,
            List<String> skills,
            String budgetType,
            String modality,
            String providerType,
            List<String> attachments,
            // ── Nuevos campos ──
            String currency,
            String language,
            BigDecimal minBudget,
            BigDecimal maxBudget,
            BigDecimal hourlyRateMin,
            BigDecimal hourlyRateMax
    ) {
        ensureEditable();

        this.title = validateRequiredText(title, "Title", 5, 150);
        this.description = validateRequiredText(description, "Description", 20, 5000);
        this.category = validateRequiredText(category, "Category", 3, 120);
        this.subcategory = subcategory;
        this.budget = budget != null ? validateAmount(budget, "Budget") : null;
        this.estimatedDays = validatePositive(estimatedDays, "Estimated days");
        this.experienceLevel = experienceLevel;
        this.skills = skills != null ? new ArrayList<>(skills) : new ArrayList<>();
        this.budgetType = budgetType;
        this.modality = modality;
        this.providerType = providerType;
        this.attachments = attachments != null ? new ArrayList<>(attachments) : new ArrayList<>();
        this.currency = currency;
        this.language = language;
        this.minBudget = minBudget;
        this.maxBudget = maxBudget;
        this.hourlyRateMin = hourlyRateMin;
        this.hourlyRateMax = hourlyRateMax;
    }

    public void submitProposal(
            UUID freelancerUserId,
            String coverLetter,
            BigDecimal proposedBudget,
            Integer estimatedDays,
            String portfolioUrl
    ) {
        ensureOpen();

        boolean alreadySubmitted = this.proposals.stream()
                .anyMatch(proposal -> proposal.getFreelancerUserId().equals(freelancerUserId));

        if (alreadySubmitted) {
            throw new IllegalArgumentException("Freelancer already submitted a proposal for this project");
        }

        Proposal proposal = Proposal.create(freelancerUserId, coverLetter, proposedBudget, estimatedDays, portfolioUrl);
        this.proposals.add(proposal);

        registerEvent(ProposalSubmittedEvent.now(this.id, proposal.getId(), freelancerUserId));
    }

    public void acceptProposal(ProposalId proposalId) {
        ensureOpen();

        Proposal acceptedProposal = this.proposals.stream()
                .filter(proposal -> proposal.getId().equals(proposalId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Proposal not found"));

        acceptedProposal.accept();
        this.selectedFreelancerUserId = acceptedProposal.getFreelancerUserId();
        this.status = ProjectStatus.IN_PROGRESS;

        this.proposals.stream()
                .filter(proposal -> !proposal.getId().equals(proposalId) && proposal.getStatus() == ProposalStatus.SUBMITTED)
                .forEach(Proposal::reject);
    }

    public void addMilestone(String title, String description, BigDecimal amount) {
        if (this.status != ProjectStatus.IN_PROGRESS) {
            throw new IllegalStateException("Milestones can be added only when project is in progress");
        }

        this.milestones.add(Milestone.create(title, description, amount));
    }

    public void complete() {
        if (this.status != ProjectStatus.IN_PROGRESS) {
            throw new IllegalStateException("Only in progress projects can be completed");
        }

        boolean allApproved = this.milestones.stream()
                .allMatch(milestone -> milestone.getStatus() == MilestoneStatus.APPROVED);

        if (!allApproved) {
            throw new IllegalStateException("All milestones must be approved before completing the project");
        }

        this.status = ProjectStatus.COMPLETED;
    }

    public void pause() {
        if (this.status != ProjectStatus.OPEN && this.status != ProjectStatus.IN_PROGRESS) {
            throw new IllegalStateException("Only OPEN or IN_PROGRESS projects can be paused");
        }

        this.status = ProjectStatus.PAUSED;
    }

    public void resume() {
        if (this.status != ProjectStatus.PAUSED) {
            throw new IllegalStateException("Only paused projects can be resumed");
        }

        // Restore to previous state: since we don't track history, restore to OPEN
        this.status = ProjectStatus.OPEN;
    }

    public void cancel() {
        if (this.status == ProjectStatus.COMPLETED) {
            throw new IllegalStateException("Completed projects cannot be cancelled");
        }

        this.status = ProjectStatus.CANCELLED;
    }

    public void delete() {
        if (this.status != ProjectStatus.DRAFT) {
            throw new IllegalStateException("Only draft projects can be deleted");
        }
    }

    public boolean belongsToClient(UUID clientUserId) {
        return this.clientUserId.equals(clientUserId);
    }

    public FreelanceProjectId getId() {
        return id;
    }

    public UUID getClientUserId() {
        return clientUserId;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getCategory() {
        return category;
    }

    public String getSubcategory() {
        return subcategory;
    }

    public BigDecimal getBudget() {
        return budget;
    }

    public Integer getEstimatedDays() {
        return estimatedDays;
    }

    public String getExperienceLevel() {
        return experienceLevel;
    }

    public List<String> getSkills() {
        return skills == null ? List.of() : List.copyOf(skills);
    }

    public String getBudgetType() {
        return budgetType;
    }

    public String getModality() {
        return modality;
    }

    public String getProviderType() {
        return providerType;
    }

    public List<String> getAttachments() {
        return attachments == null ? List.of() : List.copyOf(attachments);
    }

    public ProjectStatus getStatus() {
        return status;
    }

    public UUID getSelectedFreelancerUserId() {
        return selectedFreelancerUserId;
    }

    public List<Proposal> getProposals() {
        return List.copyOf(proposals);
    }

    public List<Milestone> getMilestones() {
        return List.copyOf(milestones);
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    // ── Nuevos getters ──
    public String getCurrency() {
        return currency;
    }

    public String getLanguage() {
        return language;
    }

    public BigDecimal getMinBudget() {
        return minBudget;
    }

    public BigDecimal getMaxBudget() {
        return maxBudget;
    }

    public BigDecimal getHourlyRateMin() {
        return hourlyRateMin;
    }

    public BigDecimal getHourlyRateMax() {
        return hourlyRateMax;
    }

    private void ensureOpen() {
        if (this.status != ProjectStatus.OPEN) {
            throw new IllegalStateException("Project is not open for proposals");
        }
    }

    private void ensureEditable() {
        if (this.status != ProjectStatus.OPEN && this.status != ProjectStatus.DRAFT) {
            throw new IllegalStateException("Project can only be updated in draft or open status");
        }
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

    private static BigDecimal validateAmount(BigDecimal value, String fieldName) {
        Objects.requireNonNull(value, fieldName + " cannot be null");

        if (value.signum() <= 0) {
            throw new IllegalArgumentException(fieldName + " must be greater than zero");
        }

        return value;
    }

    private static Integer validatePositive(Integer value, String fieldName) {
        Objects.requireNonNull(value, fieldName + " cannot be null");

        if (value <= 0) {
            throw new IllegalArgumentException(fieldName + " must be greater than zero");
        }

        return value;
    }
}