package achanvear.peru.payments.domain.model;

import achanvear.peru.payments.domain.event.PaymentCompletedEvent;
import achanvear.peru.shared.domain.AggregateRoot;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class Payment extends AggregateRoot<PaymentId> {

    private final PaymentId id;
    private final UUID milestoneId;
    private final UUID projectId;
    private final UUID clientUserId;
    private final UUID freelancerUserId;
    private final BigDecimal amount;
    private final BigDecimal platformCommission;
    private final BigDecimal freelancerAmount;
    private final String mpPaymentId;
    private PaymentStatus status;
    private Instant createdAt;
    private Instant updatedAt;

    public Payment(
            PaymentId id,
            UUID milestoneId,
            UUID projectId,
            UUID clientUserId,
            UUID freelancerUserId,
            BigDecimal amount,
            BigDecimal platformCommission,
            BigDecimal freelancerAmount,
            String mpPaymentId,
            PaymentStatus status
    ) {
        this.id = id;
        this.milestoneId = milestoneId;
        this.projectId = projectId;
        this.clientUserId = clientUserId;
        this.freelancerUserId = freelancerUserId;
        this.amount = amount;
        this.platformCommission = platformCommission;
        this.freelancerAmount = freelancerAmount;
        this.mpPaymentId = mpPaymentId;
        this.status = status;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    public static Payment create(
            UUID milestoneId,
            UUID projectId,
            UUID clientUserId,
            UUID freelancerUserId,
            BigDecimal amount,
            String mpPaymentId
    ) {
        var commission = CommissionPolicy.calculateCommission(amount);
        Payment payment = new Payment(
                new PaymentId(UUID.randomUUID()),
                milestoneId,
                projectId,
                clientUserId,
                freelancerUserId,
                amount,
                commission.platformCommission(),
                commission.freelancerAmount(),
                mpPaymentId,
                PaymentStatus.PENDING
        );
        return payment;
    }

    public void approve() {
        if (this.status != PaymentStatus.PENDING) {
            throw new IllegalStateException("Payment can only be approved from PENDING status");
        }
        this.status = PaymentStatus.APPROVED;
        this.updatedAt = Instant.now();
        addDomainEvent(new PaymentCompletedEvent(
                id.value(),
                milestoneId,
                projectId,
                clientUserId,
                freelancerUserId,
                amount,
                platformCommission,
                freelancerAmount
        ));
    }

    public void reject(String reason) {
        if (this.status != PaymentStatus.PENDING) {
            throw new IllegalStateException("Payment can only be rejected from PENDING status");
        }
        this.status = PaymentStatus.REJECTED;
        this.updatedAt = Instant.now();
    }

    // getters
    public PaymentId getId() { return id; }
    public UUID getMilestoneId() { return milestoneId; }
    public UUID getProjectId() { return projectId; }
    public UUID getClientUserId() { return clientUserId; }
    public UUID getFreelancerUserId() { return freelancerUserId; }
    public BigDecimal getAmount() { return amount; }
    public BigDecimal getPlatformCommission() { return platformCommission; }
    public BigDecimal getFreelancerAmount() { return freelancerAmount; }
    public String getMpPaymentId() { return mpPaymentId; }
    public PaymentStatus getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}