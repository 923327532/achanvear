package achanvear.peru.payments.infrastructure.persistence;

import achanvear.peru.payments.domain.model.Payout;
import achanvear.peru.payments.domain.model.PayoutId;
import achanvear.peru.payments.domain.repository.PayoutRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
public class PayoutRepositoryImpl implements PayoutRepository {

    private final PayoutJpaRepository jpaRepository;
    private final PayoutMapper mapper;

    public PayoutRepositoryImpl(PayoutJpaRepository jpaRepository, PayoutMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public void save(Payout payout) {
        jpaRepository.save(mapper.toJpa(payout));
    }

    @Override
    public Optional<Payout> findById(PayoutId id) {
        return jpaRepository.findById(id.value()).map(mapper::toDomain);
    }

    @Override
    public Optional<Payout> findByIdempotencyKey(String idempotencyKey) {
        return jpaRepository.findByIdempotencyKey(idempotencyKey).map(mapper::toDomain);
    }

    @Override
    public List<Payout> findByUserId(UUID userId) {
        return jpaRepository.findByUserId(userId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
}
