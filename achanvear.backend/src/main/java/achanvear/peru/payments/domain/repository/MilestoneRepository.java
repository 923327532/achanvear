package achanvear.peru.payments.domain.repository;

import achanvear.peru.payments.domain.model.Milestone;
import achanvear.peru.payments.domain.model.MilestoneId;
import achanvear.peru.payments.domain.model.MilestoneStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MilestoneRepository {
    void save(Milestone milestone);
    Optional<Milestone> findById(MilestoneId id);
    List<Milestone> findByProjectId(UUID projectId);
    List<Milestone> findByFreelancerUserId(UUID freelancerUserId);
    List<Milestone> findByClientUserId(UUID clientUserId);
    List<Milestone> findByStatus(MilestoneStatus status);
    Optional<Milestone> findByMpPaymentId(String mpPaymentId);
    boolean existsByMpPaymentId(String mpPaymentId);
}
