package achanvear.peru.payments.domain.repository;

import achanvear.peru.payments.domain.model.QuickRecharge;
import achanvear.peru.payments.domain.model.QuickRechargeId;
import achanvear.peru.payments.domain.model.QuickRechargeStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface QuickRechargeRepository {
    void save(QuickRecharge quickRecharge);
    Optional<QuickRecharge> findById(QuickRechargeId id);
    List<QuickRecharge> findByUserId(UUID userId);
    List<QuickRecharge> findByUserIdAndStatus(UUID userId, QuickRechargeStatus status);
    List<QuickRecharge> findByWalletId(UUID walletId);
}
