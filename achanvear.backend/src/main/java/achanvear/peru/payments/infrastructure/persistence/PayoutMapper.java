package achanvear.peru.payments.infrastructure.persistence;

import achanvear.peru.payments.domain.model.Payout;
import achanvear.peru.payments.domain.model.PayoutId;
import achanvear.peru.payments.domain.model.PayoutStatus;
import org.springframework.stereotype.Component;

@Component
public class PayoutMapper {

    public PayoutJpaEntity toJpa(Payout domain) {
        PayoutJpaEntity entity = new PayoutJpaEntity();
        entity.setId(domain.getId().value());
        entity.setUserId(domain.getUserId());
        entity.setWalletId(domain.getWalletId());
        entity.setPayoutMethodId(domain.getPayoutMethodId());
        entity.setAmount(domain.getAmount());
        entity.setStatus(domain.getStatus().name());
        entity.setExternalDisbursementId(domain.getExternalDisbursementId());
        entity.setFailureReason(domain.getFailureReason());
        entity.setIdempotencyKey(domain.getIdempotencyKey());
        entity.setRequestedAt(domain.getRequestedAt());
        entity.setCompletedAt(domain.getCompletedAt());
        entity.setFailedAt(domain.getFailedAt());
        entity.setCancelledAt(domain.getCancelledAt());
        return entity;
    }

    public Payout toDomain(PayoutJpaEntity entity) {
        return new Payout(
                new PayoutId(entity.getId()),
                entity.getUserId(),
                entity.getWalletId(),
                entity.getPayoutMethodId(),
                entity.getAmount(),
                entity.getIdempotencyKey(),
                PayoutStatus.valueOf(entity.getStatus()),
                entity.getExternalDisbursementId(),
                entity.getFailureReason(),
                entity.getRequestedAt(),
                entity.getCompletedAt(),
                entity.getFailedAt(),
                entity.getCancelledAt()
        );
    }
}
