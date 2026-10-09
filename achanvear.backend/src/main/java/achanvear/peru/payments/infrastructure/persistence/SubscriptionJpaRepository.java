package achanvear.peru.payments.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import achanvear.peru.payments.domain.model.SubscriptionStatus;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface SubscriptionJpaRepository extends JpaRepository<SubscriptionJpaEntity, UUID> {
    Optional<SubscriptionJpaEntity> findByCompanyUserId(UUID companyUserId);
    Optional<SubscriptionJpaEntity> findFirstByCompanyUserIdAndStatusAndEndDateAfterOrderByStartDateDesc(
            UUID companyUserId,
            SubscriptionStatus status,
            Instant now
    );
    Optional<SubscriptionJpaEntity> findByMpSubscriptionId(String mpSubscriptionId);
}
