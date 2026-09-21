package achanvear.peru.payments.infrastructure.persistence;

import achanvear.peru.payments.domain.model.QuickRecharge;
import achanvear.peru.payments.domain.model.QuickRechargeId;
import org.springframework.stereotype.Component;

@Component
public class QuickRechargeMapper {

    public QuickRechargeJpaEntity toJpa(QuickRecharge domain) {
        QuickRechargeJpaEntity entity = new QuickRechargeJpaEntity();
        entity.setId(domain.getId().value());
        entity.setUserId(domain.getUserId());
        entity.setWalletId(domain.getWalletId());
        entity.setAmount(domain.getAmount());
        entity.setMethod(domain.getMethod());
        entity.setReferenceCode(domain.getReferenceCode());
        entity.setPhoneNumber(domain.getPhoneNumber());
        entity.setStatus(domain.getStatus());
        entity.setMpPaymentId(domain.getMpPaymentId());
        entity.setCompletedAt(domain.getCompletedAt());
        entity.setFailedAt(domain.getFailedAt());
        entity.setFailureReason(domain.getFailureReason());
        return entity;
    }

    public QuickRecharge toDomain(QuickRechargeJpaEntity entity) {
        return new QuickRecharge(
                new QuickRechargeId(entity.getId()),
                entity.getUserId(),
                entity.getWalletId(),
                entity.getAmount(),
                entity.getMethod(),
                entity.getReferenceCode(),
                entity.getPhoneNumber(),
                entity.getStatus(),
                entity.getMpPaymentId()
        );
    }
}
