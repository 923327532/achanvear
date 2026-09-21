package achanvear.peru.payments.infrastructure.persistence;

import achanvear.peru.payments.domain.model.Dispute;
import achanvear.peru.payments.domain.model.DisputeId;
import org.springframework.stereotype.Component;

@Component
public class DisputeMapper {

    public DisputeJpaEntity toEntity(Dispute dispute) {
        DisputeJpaEntity entity = new DisputeJpaEntity();
        entity.setId(dispute.getId().value());
        entity.setMilestoneId(dispute.getMilestoneId());
        entity.setProjectId(dispute.getProjectId());
        entity.setRaisedByUserId(dispute.getRaisedByUserId());
        entity.setRaisedAgainstUserId(dispute.getRaisedAgainstUserId());
        entity.setReason(dispute.getReason());
        entity.setDescription(dispute.getDescription());
        entity.setStatus(dispute.getStatus());
        entity.setResolution(dispute.getResolution());
        entity.setResolvedByUserId(dispute.getResolvedByUserId());
        entity.setResolvedAt(dispute.getResolvedAt());
        return entity;
    }

    public Dispute toDomain(DisputeJpaEntity entity) {
        Dispute dispute = new Dispute(
                new DisputeId(entity.getId()),
                entity.getMilestoneId(),
                entity.getProjectId(),
                entity.getRaisedByUserId(),
                entity.getRaisedAgainstUserId(),
                entity.getReason(),
                entity.getDescription()
        );
        return dispute;
    }
}
