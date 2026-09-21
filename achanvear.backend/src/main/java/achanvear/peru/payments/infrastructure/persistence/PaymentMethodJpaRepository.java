package achanvear.peru.payments.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentMethodJpaRepository extends JpaRepository<PaymentMethodJpaEntity, UUID> {
    List<PaymentMethodJpaEntity> findByUserId(UUID userId);
    List<PaymentMethodJpaEntity> findByUserIdAndIsActiveTrue(UUID userId);
    Optional<PaymentMethodJpaEntity> findByUserIdAndIsDefaultTrue(UUID userId);
    Optional<PaymentMethodJpaEntity> findByMpCardId(String mpCardId);
}
