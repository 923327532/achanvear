package achanvear.peru.payments.infrastructure.persistence;

import achanvear.peru.payments.domain.model.DisputeStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DisputeJpaRepository extends JpaRepository<DisputeJpaEntity, UUID> {
    Optional<DisputeJpaEntity> findByMilestoneId(UUID milestoneId);
    List<DisputeJpaEntity> findByProjectId(UUID projectId);
    List<DisputeJpaEntity> findByStatus(DisputeStatus status);
    List<DisputeJpaEntity> findByRaisedByUserId(UUID userId);
}
