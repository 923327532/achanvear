package achanvear.peru.payments.domain.model;

import achanvear.peru.payments.domain.event.MilestoneFundedEvent;
import achanvear.peru.payments.domain.event.MilestoneReleasedEvent;
import achanvear.peru.shared.domain.AggregateRoot;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class Milestone extends AggregateRoot<MilestoneId> {

    private final MilestoneId id;
    private final UUID projectId;
    private final UUID clientUserId;
    private final UUID freelancerUserId;
    private final String title;
    private final String description;
    private final BigDecimal amount;
    private MilestoneStatus status;
    private String mpPreferenceId;
    private String mpPaymentId;
    private Instant fundedAt;
    private Instant releasedAt;
    private Instant createdAt;
    private Instant updatedAt;

    public Milestone(
            MilestoneId id,
            UUID projectId,
            UUID clientUserId,
            UUID freelancerUserId,
            String title,
            String description,
            BigDecimal amount
    ) {
        this.id = id;
        this.projectId = projectId;
        this.clientUserId = clientUserId;
        this.freelancerUserId = freelancerUserId;
        this.title = title;
        this.description = description;
        this.amount = amount;
        this.status = MilestoneStatus.PENDING;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    public static Milestone create(
            UUID projectId,
            UUID clientUserId,
            UUID freelancerUserId,
            String title,
            String description,
            BigDecimal amount
    ) {
        return new Milestone(
                new MilestoneId(UUID.randomUUID()),
                projectId,
                clientUserId,
                freelancerUserId,
                title,
                description,
                amount
        );
    }

    public void fund(String mpPreferenceId, String mpPaymentId) {
        if (this.status != MilestoneStatus.PENDING) {
            throw new IllegalStateException("Milestone can only be funded from PENDING status");
        }
        this.status = MilestoneStatus.FUNDED;
        this.mpPreferenceId = mpPreferenceId;
        this.mpPaymentId = mpPaymentId;
        this.fundedAt = Instant.now();
        this.updatedAt = this.fundedAt;
        
        addDomainEvent(new MilestoneFundedEvent(
                id.value(),
                projectId,
                clientUserId,
                freelancerUserId,
                amount
        ));
    }

    public void startWork() {
        if (this.status != MilestoneStatus.FUNDED) {
            throw new IllegalStateException("Milestone must be FUNDED to start work");
        }
        this.status = MilestoneStatus.IN_PROGRESS;
        this.updatedAt = Instant.now();
    }

    public void submitForReview() {
        if (this.status != MilestoneStatus.IN_PROGRESS) {
            throw new IllegalStateException("Milestone must be IN_PROGRESS to submit");
        }
        this.status = MilestoneStatus.READY_FOR_REVIEW;
        this.updatedAt = Instant.now();
    }

    public void release() {
        if (this.status != MilestoneStatus.READY_FOR_REVIEW) {
            throw new IllegalStateException("Milestone must be READY_FOR_REVIEW to release payment");
        }
        this.status = MilestoneStatus.RELEASED;
        this.releasedAt = Instant.now();
        this.updatedAt = this.releasedAt;
        
        addDomainEvent(new MilestoneReleasedEvent(
                id.value(),
                projectId,
                clientUserId,
                freelancerUserId,
                amount
        ));
    }

    public void dispute() {
        if (this.status != MilestoneStatus.READY_FOR_REVIEW && this.status != MilestoneStatus.IN_PROGRESS) {
            throw new IllegalStateException("Cannot dispute milestone in status: " + this.status);
        }
        this.status = MilestoneStatus.DISPUTED;
        this.updatedAt = Instant.now();
    }

    public void markAsReleased() {
        if (this.status != MilestoneStatus.READY_FOR_REVIEW && this.status != MilestoneStatus.DISPUTED && this.status != MilestoneStatus.FUNDED) {
            throw new IllegalStateException("Cannot release milestone in status: " + this.status);
        }
        this.status = MilestoneStatus.RELEASED;
        this.releasedAt = Instant.now();
        this.updatedAt = this.releasedAt;
    }

    public void markAsRefunded() {
        if (this.status != MilestoneStatus.FUNDED && this.status != MilestoneStatus.DISPUTED) {
            throw new IllegalStateException("Cannot refund milestone in status: " + this.status);
        }
        this.status = MilestoneStatus.REFUNDED;
        this.updatedAt = Instant.now();
    }

    public void markAsDisputed() {
        if (this.status != MilestoneStatus.FUNDED && this.status != MilestoneStatus.IN_PROGRESS && this.status != MilestoneStatus.READY_FOR_REVIEW) {
            throw new IllegalStateException("Cannot mark as disputed milestone in status: " + this.status);
        }
        this.status = MilestoneStatus.DISPUTED;
        this.updatedAt = Instant.now();
    }

    // Getters
    public MilestoneId getId() { return id; }
    public UUID getProjectId() { return projectId; }
    public UUID getClientUserId() { return clientUserId; }
    public UUID getFreelancerUserId() { return freelancerUserId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public BigDecimal getAmount() { return amount; }
    public MilestoneStatus getStatus() { return status; }
    public String getMpPreferenceId() { return mpPreferenceId; }
    public String getMpPaymentId() { return mpPaymentId; }
    public Instant getFundedAt() { return fundedAt; }
    public Instant getReleasedAt() { return releasedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
