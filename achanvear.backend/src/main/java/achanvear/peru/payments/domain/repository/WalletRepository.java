package achanvear.peru.payments.domain.repository;

import achanvear.peru.payments.domain.model.Wallet;
import achanvear.peru.payments.domain.model.WalletId;

import java.util.Optional;
import java.util.UUID;

public interface WalletRepository {
    void save(Wallet wallet);
    Optional<Wallet> findById(WalletId id);
    Optional<Wallet> findByUserId(UUID userId);
}
