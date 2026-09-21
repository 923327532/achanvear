package achanvear.peru.payments.infrastructure.persistence;

import achanvear.peru.payments.domain.model.PaymentMethod;
import achanvear.peru.payments.domain.model.PaymentMethodId;
import achanvear.peru.payments.domain.repository.PaymentMethodRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
public class PaymentMethodRepositoryImpl implements PaymentMethodRepository {

    private final PaymentMethodJpaRepository jpaRepository;
    private final PaymentMethodMapper mapper;

    public PaymentMethodRepositoryImpl(PaymentMethodJpaRepository jpaRepository, PaymentMethodMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public void save(PaymentMethod paymentMethod) {
        jpaRepository.save(mapper.toEntity(paymentMethod));
    }

    @Override
    public Optional<PaymentMethod> findById(PaymentMethodId id) {
        return jpaRepository.findById(id.value()).map(mapper::toDomain);
    }

    @Override
    public List<PaymentMethod> findByUserId(UUID userId) {
        return jpaRepository.findByUserId(userId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<PaymentMethod> findActiveByUserId(UUID userId) {
        return jpaRepository.findByUserIdAndIsActiveTrue(userId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<PaymentMethod> findDefaultByUserId(UUID userId) {
        return jpaRepository.findByUserIdAndIsDefaultTrue(userId).map(mapper::toDomain);
    }

    @Override
    public Optional<PaymentMethod> findByMpCardId(String mpCardId) {
        return jpaRepository.findByMpCardId(mpCardId).map(mapper::toDomain);
    }

    @Override
    public void delete(PaymentMethod paymentMethod) {
        jpaRepository.deleteById(paymentMethod.getId().value());
    }
}
