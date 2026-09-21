package achanvear.peru.payments.infrastructure.persistence;

import achanvear.peru.payments.domain.model.EscrowStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EscrowJpaRepository extends JpaRepository<EscrowJpaEntity, UUID> {
    Optional<EscrowJpaEntity> findByMilestoneId(UUID milestoneId);
    Optional<EscrowJpaEntity> findByMpPaymentId(String mpPaymentId);
    List<EscrowJpaEntity> findByClientUserId(UUID clientUserId);
    List<EscrowJpaEntity> findByFreelancerUserId(UUID freelancerUserId);
    List<EscrowJpaEntity> findByStatus(EscrowStatus status);
    List<EscrowJpaEntity> findByProjectId(UUID projectId);
}
