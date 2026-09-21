package achanvear.peru.payments.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SubscriptionJpaRepository extends JpaRepository<SubscriptionJpaEntity, UUID> {
    Optional<SubscriptionJpaEntity> findByCompanyUserId(UUID companyUserId);
    Optional<SubscriptionJpaEntity> findByMpSubscriptionId(String mpSubscriptionId);
}