package achanvear.peru.payments.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface AuditLogJpaRepository extends JpaRepository<AuditLogJpaEntity, UUID> {
    List<AuditLogJpaEntity> findByUserId(UUID userId);
    List<AuditLogJpaEntity> findByAction(String action);
    List<AuditLogJpaEntity> findByEntityTypeAndEntityId(String entityType, String entityId);
    List<AuditLogJpaEntity> findByCreatedAtBetween(Instant from, Instant to);
}
