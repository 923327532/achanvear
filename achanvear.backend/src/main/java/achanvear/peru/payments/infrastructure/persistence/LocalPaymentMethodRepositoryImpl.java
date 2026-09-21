package achanvear.peru.payments.infrastructure.persistence;

import achanvear.peru.payments.domain.model.LocalPaymentMethod;
import achanvear.peru.payments.domain.model.LocalPaymentMethodId;
import achanvear.peru.payments.domain.repository.LocalPaymentMethodRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
public class LocalPaymentMethodRepositoryImpl implements LocalPaymentMethodRepository {

    private final LocalPaymentMethodJpaRepository jpaRepository;
    private final LocalPaymentMethodMapper mapper;

    public LocalPaymentMethodRepositoryImpl(LocalPaymentMethodJpaRepository jpaRepository, LocalPaymentMethodMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public void save(LocalPaymentMethod method) {
        jpaRepository.save(mapper.toJpa(method));
    }

    @Override
    public Optional<LocalPaymentMethod> findById(LocalPaymentMethodId id) {
        return jpaRepository.findById(id.value()).map(mapper::toDomain);
    }

    @Override
    public List<LocalPaymentMethod> findByUserId(UUID userId) {
        return jpaRepository.findByUserId(userId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<LocalPaymentMethod> findByUserIdAndMethodType(UUID userId, String methodType) {
        return jpaRepository.findByUserIdAndMethodType(userId, methodType).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<LocalPaymentMethod> findDefaultByUserId(UUID userId) {
        return jpaRepository.findByUserIdAndIsDefaultTrue(userId).map(mapper::toDomain);
    }

    @Override
    public void delete(LocalPaymentMethod method) {
        jpaRepository.deleteById(method.getId().value());
    }
}
