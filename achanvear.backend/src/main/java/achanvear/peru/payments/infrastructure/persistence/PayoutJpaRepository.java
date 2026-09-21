package achanvear.peru.payments.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PayoutJpaRepository extends JpaRepository<PayoutJpaEntity, UUID> {

    Optional<PayoutJpaEntity> findByIdempotencyKey(String idempotencyKey);

    List<PayoutJpaEntity> findByUserId(UUID userId);
}
