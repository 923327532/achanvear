package achanvear.peru.payments.infrastructure.persistence;

import achanvear.peru.payments.domain.model.PaymentStatus;
import achanvear.peru.shared.infrastructure.BaseJpaEntity;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "payments")
public class PaymentJpaEntity extends BaseJpaEntity {

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

    @Column(name = "freelancer_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal freelancerAmount;

    @Column(name = "mp_payment_id", nullable = false, unique = true)
    private String mpPaymentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PaymentStatus status;

    // getters y setters
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

    public BigDecimal getFreelancerAmount() { return freelancerAmount; }
    public void setFreelancerAmount(BigDecimal freelancerAmount) { this.freelancerAmount = freelancerAmount; }

    public String getMpPaymentId() { return mpPaymentId; }
    public void setMpPaymentId(String mpPaymentId) { this.mpPaymentId = mpPaymentId; }

    public PaymentStatus getStatus() { return status; }
    public void setStatus(PaymentStatus status) { this.status = status; }
}