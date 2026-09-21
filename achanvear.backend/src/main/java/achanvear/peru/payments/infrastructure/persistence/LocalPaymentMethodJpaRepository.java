package achanvear.peru.payments.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LocalPaymentMethodJpaRepository extends JpaRepository<LocalPaymentMethodJpaEntity, UUID> {
    List<LocalPaymentMethodJpaEntity> findByUserId(UUID userId);
    List<LocalPaymentMethodJpaEntity> findByUserIdAndMethodType(UUID userId, String methodType);
    Optional<LocalPaymentMethodJpaEntity> findByUserIdAndIsDefaultTrue(UUID userId);
}
