package achanvear.peru.payments.domain.repository;

import achanvear.peru.payments.domain.model.WalletTransaction;
import achanvear.peru.payments.domain.model.WalletTransactionId;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WalletTransactionRepository {
    void save(WalletTransaction transaction);
    Optional<WalletTransaction> findById(WalletTransactionId id);
    List<WalletTransaction> findByWalletId(UUID walletId);
    List<WalletTransaction> findByUserId(UUID userId);
}
