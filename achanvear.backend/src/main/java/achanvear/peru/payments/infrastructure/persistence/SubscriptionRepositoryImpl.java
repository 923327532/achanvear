package achanvear.peru.payments.infrastructure.persistence;

import achanvear.peru.payments.domain.model.Subscription;
import achanvear.peru.payments.domain.model.SubscriptionId;
import achanvear.peru.payments.domain.repository.SubscriptionRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public class SubscriptionRepositoryImpl implements SubscriptionRepository {

    private final SubscriptionJpaRepository jpaRepository;
    private final SubscriptionMapper mapper;

    public SubscriptionRepositoryImpl(SubscriptionJpaRepository jpaRepository, SubscriptionMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public void save(Subscription subscription) {
        jpaRepository.save(mapper.toEntity(subscription));
    }

    @Override
    public Optional<Subscription> findById(SubscriptionId id) {
        return jpaRepository.findById(id.value()).map(mapper::toDomain);
    }

    @Override
    public Optional<Subscription> findByCompanyUserId(UUID companyUserId) {
        return jpaRepository.findByCompanyUserId(companyUserId).map(mapper::toDomain);
    }

    @Override
    public Optional<Subscription> findByMpSubscriptionId(String mpSubscriptionId) {
        return jpaRepository.findByMpSubscriptionId(mpSubscriptionId).map(mapper::toDomain);
    }
}