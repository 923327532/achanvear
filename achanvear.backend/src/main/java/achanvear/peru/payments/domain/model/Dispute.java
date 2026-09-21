package achanvear.peru.payments.domain.model;

import achanvear.peru.shared.domain.AggregateRoot;

import java.time.Instant;
import java.util.UUID;

public class Dispute extends AggregateRoot<DisputeId> {

    private final DisputeId id;
    private final UUID milestoneId;
    private final UUID projectId;
    private final UUID raisedByUserId;
    private final UUID raisedAgainstUserId;
    private final String reason;
    private final String description;
    private DisputeStatus status;
    private String resolution;
    private UUID resolvedByUserId;
    private Instant resolvedAt;
    private Instant createdAt;
    private Instant updatedAt;

    public Dispute(
            DisputeId id,
            UUID milestoneId,
            UUID projectId,
            UUID raisedByUserId,
            UUID raisedAgainstUserId,
            String reason,
            String description
    ) {
        this.id = id;
        this.milestoneId = milestoneId;
        this.projectId = projectId;
        this.raisedByUserId = raisedByUserId;
        this.raisedAgainstUserId = raisedAgainstUserId;
        this.reason = reason;
        this.description = description;
        this.status = DisputeStatus.OPEN;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    public static Dispute create(
            UUID milestoneId,
            UUID projectId,
            UUID raisedByUserId,
            UUID raisedAgainstUserId,
            String reason,
            String description
    ) {
        return new Dispute(
                new DisputeId(UUID.randomUUID()),
                milestoneId,
                projectId,
                raisedByUserId,
                raisedAgainstUserId,
                reason,
                description
        );
    }

    public void startReview() {
        if (this.status != DisputeStatus.OPEN) {
            throw new IllegalStateException("Dispute can only be reviewed from OPEN status");
        }
        this.status = DisputeStatus.UNDER_REVIEW;
        this.updatedAt = Instant.now();
    }

    public void resolve(String resolution, UUID resolvedByUserId) {
        if (this.status != DisputeStatus.UNDER_REVIEW && this.status != DisputeStatus.OPEN) {
            throw new IllegalStateException("Dispute can only be resolved from OPEN or UNDER_REVIEW status");
        }
        this.status = DisputeStatus.RESOLVED;
        this.resolution = resolution;
        this.resolvedByUserId = resolvedByUserId;
        this.resolvedAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public void dismiss(String resolution, UUID resolvedByUserId) {
        if (this.status != DisputeStatus.UNDER_REVIEW && this.status != DisputeStatus.OPEN) {
            throw new IllegalStateException("Dispute can only be dismissed from OPEN or UNDER_REVIEW status");
        }
        this.status = DisputeStatus.DISMISSED;
        this.resolution = resolution;
        this.resolvedByUserId = resolvedByUserId;
        this.resolvedAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    // Getters
    public DisputeId getId() { return id; }
    public UUID getMilestoneId() { return milestoneId; }
    public UUID getProjectId() { return projectId; }
    public UUID getRaisedByUserId() { return raisedByUserId; }
    public UUID getRaisedAgainstUserId() { return raisedAgainstUserId; }
    public String getReason() { return reason; }
    public String getDescription() { return description; }
    public DisputeStatus getStatus() { return status; }
    public String getResolution() { return resolution; }
    public UUID getResolvedByUserId() { return resolvedByUserId; }
    public Instant getResolvedAt() { return resolvedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
