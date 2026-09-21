package achanvear.peru.payments.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PayoutMethodJpaRepository extends JpaRepository<PayoutMethodJpaEntity, UUID> {

    List<PayoutMethodJpaEntity> findByUserId(UUID userId);

    Optional<PayoutMethodJpaEntity> findByUserIdAndIsDefaultTrue(UUID userId);

    List<PayoutMethodJpaEntity> findByUserIdAndIsActiveTrue(UUID userId);
}
