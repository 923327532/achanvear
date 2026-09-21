package achanvear.peru.payments.infrastructure.persistence;

import achanvear.peru.payments.domain.model.Wallet;
import achanvear.peru.payments.domain.model.WalletId;
import achanvear.peru.payments.domain.repository.WalletRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public class WalletRepositoryImpl implements WalletRepository {

    private final WalletJpaRepository jpaRepository;
    private final WalletMapper mapper;

    public WalletRepositoryImpl(WalletJpaRepository jpaRepository, WalletMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public void save(Wallet wallet) {
        jpaRepository.save(mapper.toJpa(wallet));
    }

    @Override
    public Optional<Wallet> findById(WalletId id) {
        return jpaRepository.findById(id.value()).map(mapper::toDomain);
    }

    @Override
    public Optional<Wallet> findByUserId(UUID userId) {
        return jpaRepository.findByUserId(userId).map(mapper::toDomain);
    }
}
