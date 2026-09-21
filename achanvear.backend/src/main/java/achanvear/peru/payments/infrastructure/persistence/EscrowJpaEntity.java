package achanvear.peru.payments.infrastructure.persistence;

import achanvear.peru.payments.domain.model.EscrowStatus;
import achanvear.peru.shared.infrastructure.BaseJpaEntity;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "escrow")
public class EscrowJpaEntity extends BaseJpaEntity {

    @Id
    private UUID id;

    @Column(name = "milestone_id", nullable = false)
    private UUID milestoneId;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "client_user_id", nullable = false)
    private UUID clientUserId;

    @Column(name = "freelancer_user_id", nullable = false)
    private UUID freelancerUserId;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "platform_commission", nullable = false, precision = 12, scale = 2)
    private BigDecimal platformCommission;

    @Column(name = "mp_commission", nullable = false, precision = 12, scale = 2)
    private BigDecimal mpCommission;

    @Column(name = "freelancer_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal freelancerAmount;

    @Column(name = "mp_payment_id", length = 100)
    private String mpPaymentId;

    @Column(name = "mp_preference_id", length = 100)
    private String mpPreferenceId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private EscrowStatus status;

    @Column(name = "held_at")
    private Instant heldAt;

    @Column(name = "released_at")
    private Instant releasedAt;

    @Column(name = "refunded_at")
    private Instant refundedAt;

    @Column(name = "disputed_at")
    private Instant disputedAt;

    @Column(name = "dispute_reason", length = 2000)
    private String disputeReason;

    @Column(name = "resolution_notes", length = 2000)
    private String resolutionNotes;

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getMilestoneId() { return milestoneId; }
    public void setMilestoneId(UUID milestoneId) { this.milestoneId = milestoneId; }

    public UUID getProjectId() { return projectId; }
    public void setProjectId(UUID projectId) { this.projectId = projectId; }

    public UUID getClientUserId() { return clientUserId; }
    public void setClientUserId(UUID clientUserId) { this.clientUserId = clientUserId; }

    public UUID getFreelancerUserId() { return freelancerUserId; }
    public void setFreelancerUserId(UUID freelancerUserId) { this.freelancerUserId = freelancerUserId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public BigDecimal getPlatformCommission() { return platformCommission; }
    public void setPlatformCommission(BigDecimal platformCommission) { this.platformCommission = platformCommission; }

    public BigDecimal getMpCommission() { return mpCommission; }
    public void setMpCommission(BigDecimal mpCommission) { this.mpCommission = mpCommission; }

    public BigDecimal getFreelancerAmount() { return freelancerAmount; }
    public void setFreelancerAmount(BigDecimal freelancerAmount) { this.freelancerAmount = freelancerAmount; }

    public String getMpPaymentId() { return mpPaymentId; }
    public void setMpPaymentId(String mpPaymentId) { this.mpPaymentId = mpPaymentId; }

    public String getMpPreferenceId() { return mpPreferenceId; }
    public void setMpPreferenceId(String mpPreferenceId) { this.mpPreferenceId = mpPreferenceId; }

    public EscrowStatus getStatus() { return status; }
    public void setStatus(EscrowStatus status) { this.status = status; }

    public Instant getHeldAt() { return heldAt; }
    public void setHeldAt(Instant heldAt) { this.heldAt = heldAt; }

    public Instant getReleasedAt() { return releasedAt; }
    public void setReleasedAt(Instant releasedAt) { this.releasedAt = releasedAt; }

    public Instant getRefundedAt() { return refundedAt; }
    public void setRefundedAt(Instant refundedAt) { this.refundedAt = refundedAt; }

    public Instant getDisputedAt() { return disputedAt; }
    public void setDisputedAt(Instant disputedAt) { this.disputedAt = disputedAt; }

    public String getDisputeReason() { return disputeReason; }
    public void setDisputeReason(String disputeReason) { this.disputeReason = disputeReason; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
}
