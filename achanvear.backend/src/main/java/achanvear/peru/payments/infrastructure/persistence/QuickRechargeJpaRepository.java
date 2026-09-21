package achanvear.peru.payments.infrastructure.persistence;

import achanvear.peru.payments.domain.model.QuickRechargeStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface QuickRechargeJpaRepository extends JpaRepository<QuickRechargeJpaEntity, UUID> {
    List<QuickRechargeJpaEntity> findByUserId(UUID userId);
    List<QuickRechargeJpaEntity> findByUserIdAndStatus(UUID userId, QuickRechargeStatus status);
    List<QuickRechargeJpaEntity> findByWalletId(UUID walletId);
}
