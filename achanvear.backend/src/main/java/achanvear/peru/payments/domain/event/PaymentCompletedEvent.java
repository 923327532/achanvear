package achanvear.peru.payments.domain.event;

import achanvear.peru.shared.domain.DomainEvent;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PaymentCompletedEvent(
        UUID paymentId,
        UUID milestoneId,
        UUID projectId,
        UUID clientUserId,
        UUID freelancerUserId,
        BigDecimal amount,
        BigDecimal platformCommission,
        BigDecimal freelancerAmount,
        Instant occurredAt
) implements DomainEvent {

    public PaymentCompletedEvent {
        if (occurredAt == null) {
            occurredAt = Instant.now();
        }
    }

    public PaymentCompletedEvent(
            UUID paymentId,
            UUID milestoneId,
            UUID projectId,
            UUID clientUserId,
            UUID freelancerUserId,
            BigDecimal amount,
            BigDecimal platformCommission,
            BigDecimal freelancerAmount
    ) {
        this(paymentId, milestoneId, projectId, clientUserId, freelancerUserId,
                amount, platformCommission, freelancerAmount, Instant.now());
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        PaymentCompletedEvent that = (PaymentCompletedEvent) obj;
        return paymentId.equals(that.paymentId) && milestoneId.equals(that.milestoneId) && projectId.equals(that.projectId) && clientUserId.equals(that.clientUserId) && freelancerUserId.equals(that.freelancerUserId) && amount.equals(that.amount) && platformCommission.equals(that.platformCommission) && freelancerAmount.equals(that.freelancerAmount) && occurredAt.equals(that.occurredAt);
    }

    @Override
    public int hashCode() {
        return java.util.Objects.hash(paymentId, milestoneId, projectId, clientUserId, freelancerUserId, amount, platformCommission, freelancerAmount, occurredAt);
    }

    @Override
    public String toString() {
        return "PaymentCompletedEvent{" +
                "paymentId=" + paymentId +
                ", milestoneId=" + milestoneId +
                ", projectId=" + projectId +
                ", clientUserId=" + clientUserId +
                ", freelancerUserId=" + freelancerUserId +
                ", amount=" + amount +
                ", platformCommission=" + platformCommission +
                ", freelancerAmount=" + freelancerAmount +
                ", occurredAt=" + occurredAt +
                '}';
    }

    @Override
    public Instant occurredAt() {
        return occurredAt;
    }
}