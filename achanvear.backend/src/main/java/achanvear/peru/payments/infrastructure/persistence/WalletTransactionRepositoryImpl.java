package achanvear.peru.payments.infrastructure.persistence;

import achanvear.peru.payments.domain.model.WalletTransaction;
import achanvear.peru.payments.domain.model.WalletTransactionId;
import achanvear.peru.payments.domain.repository.WalletTransactionRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
public class WalletTransactionRepositoryImpl implements WalletTransactionRepository {

    private final WalletTransactionJpaRepository jpaRepository;
    private final WalletTransactionMapper mapper;

    public WalletTransactionRepositoryImpl(WalletTransactionJpaRepository jpaRepository, WalletTransactionMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public void save(WalletTransaction transaction) {
        jpaRepository.save(mapper.toJpa(transaction));
    }

    @Override
    public Optional<WalletTransaction> findById(WalletTransactionId id) {
        return jpaRepository.findById(id.value()).map(mapper::toDomain);
    }

    @Override
    public List<WalletTransaction> findByWalletId(UUID walletId) {
        return jpaRepository.findByWalletId(walletId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<WalletTransaction> findByUserId(UUID userId) {
        return jpaRepository.findByUserId(userId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
}
