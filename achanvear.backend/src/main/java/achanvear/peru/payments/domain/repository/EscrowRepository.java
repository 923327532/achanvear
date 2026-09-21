package achanvear.peru.payments.domain.repository;

import achanvear.peru.payments.domain.model.Escrow;
import achanvear.peru.payments.domain.model.EscrowId;
import achanvear.peru.payments.domain.model.EscrowStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EscrowRepository {
    void save(Escrow escrow);
    Optional<Escrow> findById(EscrowId id);
    Optional<Escrow> findByMilestoneId(UUID milestoneId);
    Optional<Escrow> findByMpPaymentId(String mpPaymentId);
    List<Escrow> findByClientUserId(UUID clientUserId);
    List<Escrow> findByFreelancerUserId(UUID freelancerUserId);
    List<Escrow> findByStatus(EscrowStatus status);
    List<Escrow> findByProjectId(UUID projectId);
}
