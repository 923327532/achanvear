package achanvear.peru.payments.infrastructure.persistence;

import achanvear.peru.payments.domain.model.Wallet;
import achanvear.peru.payments.domain.model.WalletId;
import org.springframework.stereotype.Component;

@Component
public class WalletMapper {

    public WalletJpaEntity toJpa(Wallet domain) {
        WalletJpaEntity entity = new WalletJpaEntity();
        entity.setId(domain.getId().value());
        entity.setUserId(domain.getUserId());
        entity.setBalance(domain.getBalance());
        entity.setTotalDeposited(domain.getTotalDeposited());
        entity.setTotalWithdrawn(domain.getTotalWithdrawn());
        entity.setTotalSpent(domain.getTotalSpent());
        entity.setCurrency(domain.getCurrency());
        entity.setActive(domain.isActive());
        return entity;
    }

    public Wallet toDomain(WalletJpaEntity entity) {
        return new Wallet(
                new WalletId(entity.getId()),
                entity.getUserId(),
                entity.getBalance(),
                entity.getTotalDeposited(),
                entity.getTotalWithdrawn(),
                entity.getTotalSpent(),
                entity.getCurrency(),
                entity.isActive()
        );
    }
}
