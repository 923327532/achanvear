package achanvear.peru.payments.infrastructure.persistence;

import achanvear.peru.payments.domain.model.MilestoneStatus;
import achanvear.peru.shared.infrastructure.BaseJpaEntity;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity(name = "PaymentMilestone")
@Table(name = "milestones")
public class MilestoneJpaEntity extends BaseJpaEntity {

    @Id
    private UUID id;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "client_user_id", nullable = false)
    private UUID clientUserId;

    @Column(name = "freelancer_user_id", nullable = false)
    private UUID freelancerUserId;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", length = 2000)
    private String description;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private MilestoneStatus status;

    @Column(name = "mp_preference_id", length = 100)
    private String mpPreferenceId;

    @Column(name = "mp_payment_id", length = 100, unique = true)
    private String mpPaymentId;

    @Column(name = "funded_at")
    private Instant fundedAt;

    @Column(name = "released_at")
    private Instant releasedAt;

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getProjectId() { return projectId; }
    public void setProjectId(UUID projectId) { this.projectId = projectId; }

    public UUID getClientUserId() { return clientUserId; }
    public void setClientUserId(UUID clientUserId) { this.clientUserId = clientUserId; }

    public UUID getFreelancerUserId() { return freelancerUserId; }
    public void setFreelancerUserId(UUID freelancerUserId) { this.freelancerUserId = freelancerUserId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public MilestoneStatus getStatus() { return status; }
    public void setStatus(MilestoneStatus status) { this.status = status; }

    public String getMpPreferenceId() { return mpPreferenceId; }
    public void setMpPreferenceId(String mpPreferenceId) { this.mpPreferenceId = mpPreferenceId; }

    public String getMpPaymentId() { return mpPaymentId; }
    public void setMpPaymentId(String mpPaymentId) { this.mpPaymentId = mpPaymentId; }

    public Instant getFundedAt() { return fundedAt; }
    public void setFundedAt(Instant fundedAt) { this.fundedAt = fundedAt; }

    public Instant getReleasedAt() { return releasedAt; }
    public void setReleasedAt(Instant releasedAt) { this.releasedAt = releasedAt; }
}
