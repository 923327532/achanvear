package achanvear.peru.payments.infrastructure.persistence;

import achanvear.peru.payments.domain.model.WalletTransaction;
import achanvear.peru.payments.domain.model.WalletTransactionId;
import org.springframework.stereotype.Component;

@Component
public class WalletTransactionMapper {

    public WalletTransactionJpaEntity toJpa(WalletTransaction domain) {
        WalletTransactionJpaEntity entity = new WalletTransactionJpaEntity();
        entity.setId(domain.getId().value());
        entity.setWalletId(domain.getWalletId());
        entity.setUserId(domain.getUserId());
        entity.setType(domain.getType());
        entity.setAmount(domain.getAmount());
        entity.setBalanceBefore(domain.getBalanceBefore());
        entity.setBalanceAfter(domain.getBalanceAfter());
        entity.setReferenceType(domain.getReferenceType());
        entity.setReferenceId(domain.getReferenceId());
        entity.setDescription(domain.getDescription());
        entity.setStatus(domain.getStatus());
        return entity;
    }

    public WalletTransaction toDomain(WalletTransactionJpaEntity entity) {
        return new WalletTransaction(
                new WalletTransactionId(entity.getId()),
                entity.getWalletId(),
                entity.getUserId(),
                entity.getType(),
                entity.getAmount(),
                entity.getBalanceBefore(),
                entity.getBalanceAfter(),
                entity.getReferenceType(),
                entity.getReferenceId(),
                entity.getDescription(),
                entity.getStatus()
        );
    }
}
