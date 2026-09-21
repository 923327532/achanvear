package achanvear.peru.payments.infrastructure.persistence;

import achanvear.peru.payments.domain.model.PayoutMethod;
import achanvear.peru.payments.domain.model.PayoutMethodId;
import achanvear.peru.payments.domain.repository.PayoutMethodRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
public class PayoutMethodRepositoryImpl implements PayoutMethodRepository {

    private final PayoutMethodJpaRepository jpaRepository;
    private final PayoutMethodMapper mapper;

    public PayoutMethodRepositoryImpl(PayoutMethodJpaRepository jpaRepository, PayoutMethodMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public void save(PayoutMethod method) {
        jpaRepository.save(mapper.toJpa(method));
    }

    @Override
    public Optional<PayoutMethod> findById(PayoutMethodId id) {
        return jpaRepository.findById(id.value()).map(mapper::toDomain);
    }

    @Override
    public List<PayoutMethod> findByUserId(UUID userId) {
        return jpaRepository.findByUserId(userId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<PayoutMethod> findDefaultByUserId(UUID userId) {
        return jpaRepository.findByUserIdAndIsDefaultTrue(userId).map(mapper::toDomain);
    }

    @Override
    public List<PayoutMethod> findByUserIdAndActiveTrue(UUID userId) {
        return jpaRepository.findByUserIdAndIsActiveTrue(userId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(PayoutMethod method) {
        jpaRepository.deleteById(method.getId().value());
    }
}
