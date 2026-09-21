package achanvear.peru.payments.infrastructure.persistence;

import achanvear.peru.payments.domain.model.Payment;
import achanvear.peru.payments.domain.model.PaymentId;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {

    public PaymentJpaEntity toEntity(Payment payment) {
        PaymentJpaEntity entity = new PaymentJpaEntity();
        entity.setId(payment.getId().value());
        entity.setMilestoneId(payment.getMilestoneId());
        entity.setProjectId(payment.getProjectId());
        entity.setClientUserId(payment.getClientUserId());
        entity.setFreelancerUserId(payment.getFreelancerUserId());
        entity.setAmount(payment.getAmount());
        entity.setPlatformCommission(payment.getPlatformCommission());
        entity.setFreelancerAmount(payment.getFreelancerAmount());
        entity.setMpPaymentId(payment.getMpPaymentId());
        entity.setStatus(payment.getStatus());
        return entity;
    }

    public Payment toDomain(PaymentJpaEntity entity) {
        return new Payment(
                new PaymentId(entity.getId()),
                entity.getMilestoneId(),
                entity.getProjectId(),
                entity.getClientUserId(),
                entity.getFreelancerUserId(),
                entity.getAmount(),
                entity.getPlatformCommission(),
                entity.getFreelancerAmount(),
                entity.getMpPaymentId(),
                entity.getStatus()
        );
    }
}