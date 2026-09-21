package achanvear.peru.payments.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface WalletTransactionJpaRepository extends JpaRepository<WalletTransactionJpaEntity, UUID> {
    List<WalletTransactionJpaEntity> findByWalletId(UUID walletId);
    List<WalletTransactionJpaEntity> findByUserId(UUID userId);
}
