package achanvear.peru.payments.domain.repository;

import achanvear.peru.payments.domain.model.Dispute;
import achanvear.peru.payments.domain.model.DisputeId;
import achanvear.peru.payments.domain.model.DisputeStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DisputeRepository {
    void save(Dispute dispute);
    Optional<Dispute> findById(DisputeId id);
    Optional<Dispute> findByMilestoneId(UUID milestoneId);
    List<Dispute> findByProjectId(UUID projectId);
    List<Dispute> findByStatus(DisputeStatus status);
    List<Dispute> findByRaisedByUserId(UUID userId);
}
