package achanvear.peru.payments.infrastructure.persistence;

import achanvear.peru.payments.domain.model.QuickRecharge;
import achanvear.peru.payments.domain.model.QuickRechargeId;
import achanvear.peru.payments.domain.model.QuickRechargeStatus;
import achanvear.peru.payments.domain.repository.QuickRechargeRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
public class QuickRechargeRepositoryImpl implements QuickRechargeRepository {

    private final QuickRechargeJpaRepository jpaRepository;
    private final QuickRechargeMapper mapper;

    public QuickRechargeRepositoryImpl(QuickRechargeJpaRepository jpaRepository, QuickRechargeMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public void save(QuickRecharge quickRecharge) {
        jpaRepository.save(mapper.toJpa(quickRecharge));
    }

    @Override
    public Optional<QuickRecharge> findById(QuickRechargeId id) {
        return jpaRepository.findById(id.value()).map(mapper::toDomain);
    }

    @Override
    public List<QuickRecharge> findByUserId(UUID userId) {
        return jpaRepository.findByUserId(userId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<QuickRecharge> findByUserIdAndStatus(UUID userId, QuickRechargeStatus status) {
        return jpaRepository.findByUserIdAndStatus(userId, status).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<QuickRecharge> findByWalletId(UUID walletId) {
        return jpaRepository.findByWalletId(walletId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
}
