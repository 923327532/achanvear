package achanvear.peru.payments.domain.model;

import achanvear.peru.shared.domain.AggregateRoot;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class Escrow extends AggregateRoot<EscrowId> {

    private final EscrowId id;
    private final UUID milestoneId;
    private final UUID projectId;
    private final UUID clientUserId;
    private final UUID freelancerUserId;
    private final BigDecimal amount;
    private final BigDecimal platformCommission;
    private final BigDecimal mpCommission;
    private final BigDecimal freelancerAmount;
    private String mpPaymentId;
    private String mpPreferenceId;
    private EscrowStatus status;
    private Instant heldAt;
    private Instant releasedAt;
    private Instant refundedAt;
    private Instant disputedAt;
    private String disputeReason;
    private String resolutionNotes;
    private Instant createdAt;
    private Instant updatedAt;

    public Escrow(
            EscrowId id,
            UUID milestoneId,
            UUID projectId,
            UUID clientUserId,
            UUID freelancerUserId,
            BigDecimal amount,
            BigDecimal platformCommission,
            BigDecimal mpCommission,
            BigDecimal freelancerAmount,
            String mpPaymentId,
            String mpPreferenceId,
            EscrowStatus status
    ) {
        this.id = id;
        this.milestoneId = milestoneId;
        this.projectId = projectId;
        this.clientUserId = clientUserId;
        this.freelancerUserId = freelancerUserId;
        this.amount = amount;
        this.platformCommission = platformCommission;
        this.mpCommission = mpCommission;
        this.freelancerAmount = freelancerAmount;
        this.mpPaymentId = mpPaymentId;
        this.mpPreferenceId = mpPreferenceId;
        this.status = status;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    public static Escrow create(
            UUID milestoneId,
            UUID projectId,
            UUID clientUserId,
            UUID freelancerUserId,
            BigDecimal amount,
            String mpPaymentId,
            String mpPreferenceId
    ) {
        var commission = CommissionPolicy.calculateCommission(amount);
        Escrow escrow = new Escrow(
                new EscrowId(UUID.randomUUID()),
                milestoneId,
                projectId,
                clientUserId,
                freelancerUserId,
                amount,
                commission.platformCommission(),
                commission.mpCommission(),
                commission.freelancerAmount(),
                mpPaymentId,
                mpPreferenceId,
                EscrowStatus.HELD
        );
        escrow.heldAt = Instant.now();
        return escrow;
    }

    public void hold() {
        if (this.status != EscrowStatus.PENDING) {
            throw new IllegalStateException("Escrow can only be held from PENDING status");
        }
        this.status = EscrowStatus.HELD;
        this.heldAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public void release() {
        if (this.status != EscrowStatus.HELD) {
            throw new IllegalStateException("Escrow can only be released from HELD status");
        }
        this.status = EscrowStatus.RELEASED;
        this.releasedAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public void refund(String reason) {
        if (this.status != EscrowStatus.HELD && this.status != EscrowStatus.DISPUTED) {
            throw new IllegalStateException("Escrow can only be refunded from HELD or DISPUTED status");
        }
        this.status = EscrowStatus.REFUNDED;
        this.refundedAt = Instant.now();
        this.resolutionNotes = reason;
        this.updatedAt = Instant.now();
    }

    public void dispute(String reason) {
        if (this.status != EscrowStatus.HELD) {
            throw new IllegalStateException("Escrow can only be disputed from HELD status");
        }
        this.status = EscrowStatus.DISPUTED;
        this.disputedAt = Instant.now();
        this.disputeReason = reason;
        this.updatedAt = Instant.now();
    }

    public void resolveDispute(String resolution, boolean releaseToFreelancer) {
        if (this.status != EscrowStatus.DISPUTED) {
            throw new IllegalStateException("Escrow must be DISPUTED to resolve");
        }
        this.resolutionNotes = resolution;
        if (releaseToFreelancer) {
            this.status = EscrowStatus.RELEASED;
            this.releasedAt = Instant.now();
        } else {
            this.status = EscrowStatus.REFUNDED;
            this.refundedAt = Instant.now();
        }
        this.updatedAt = Instant.now();
    }

    // Getters
    public EscrowId getId() { return id; }
    public UUID getMilestoneId() { return milestoneId; }
    public UUID getProjectId() { return projectId; }
    public UUID getClientUserId() { return clientUserId; }
    public UUID getFreelancerUserId() { return freelancerUserId; }
    public BigDecimal getAmount() { return amount; }
    public BigDecimal getPlatformCommission() { return platformCommission; }
    public BigDecimal getMpCommission() { return mpCommission; }
    public BigDecimal getFreelancerAmount() { return freelancerAmount; }
    public String getMpPaymentId() { return mpPaymentId; }
    public String getMpPreferenceId() { return mpPreferenceId; }
    public EscrowStatus getStatus() { return status; }
    public Instant getHeldAt() { return heldAt; }
    public Instant getReleasedAt() { return releasedAt; }
    public Instant getRefundedAt() { return refundedAt; }
    public Instant getDisputedAt() { return disputedAt; }
    public String getDisputeReason() { return disputeReason; }
    public String getResolutionNotes() { return resolutionNotes; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
