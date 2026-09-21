package achanvear.peru.payments.infrastructure.persistence;

import achanvear.peru.payments.domain.model.MilestoneStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MilestoneJpaRepository extends JpaRepository<MilestoneJpaEntity, UUID> {
    List<MilestoneJpaEntity> findByProjectId(UUID projectId);
    List<MilestoneJpaEntity> findByFreelancerUserId(UUID freelancerUserId);
    List<MilestoneJpaEntity> findByClientUserId(UUID clientUserId);
    List<MilestoneJpaEntity> findByStatus(MilestoneStatus status);
    Optional<MilestoneJpaEntity> findByMpPaymentId(String mpPaymentId);
    boolean existsByMpPaymentId(String mpPaymentId);
}
