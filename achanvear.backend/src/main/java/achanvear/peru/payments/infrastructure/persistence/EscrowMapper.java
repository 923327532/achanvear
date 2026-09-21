package achanvear.peru.payments.infrastructure.persistence;

import achanvear.peru.payments.domain.model.Escrow;
import achanvear.peru.payments.domain.model.EscrowId;
import org.springframework.stereotype.Component;

@Component
public class EscrowMapper {

    public EscrowJpaEntity toEntity(Escrow escrow) {
        EscrowJpaEntity entity = new EscrowJpaEntity();
        entity.setId(escrow.getId().value());
        entity.setMilestoneId(escrow.getMilestoneId());
        entity.setProjectId(escrow.getProjectId());
        entity.setClientUserId(escrow.getClientUserId());
        entity.setFreelancerUserId(escrow.getFreelancerUserId());
        entity.setAmount(escrow.getAmount());
        entity.setPlatformCommission(escrow.getPlatformCommission());
        entity.setMpCommission(escrow.getMpCommission());
        entity.setFreelancerAmount(escrow.getFreelancerAmount());
        entity.setMpPaymentId(escrow.getMpPaymentId());
        entity.setMpPreferenceId(escrow.getMpPreferenceId());
        entity.setStatus(escrow.getStatus());
        entity.setHeldAt(escrow.getHeldAt());
        entity.setReleasedAt(escrow.getReleasedAt());
        entity.setRefundedAt(escrow.getRefundedAt());
        entity.setDisputedAt(escrow.getDisputedAt());
        entity.setDisputeReason(escrow.getDisputeReason());
        entity.setResolutionNotes(escrow.getResolutionNotes());
        return entity;
    }

    public Escrow toDomain(EscrowJpaEntity entity) {
        return new Escrow(
                new EscrowId(entity.getId()),
                entity.getMilestoneId(),
                entity.getProjectId(),
                entity.getClientUserId(),
                entity.getFreelancerUserId(),
                entity.getAmount(),
                entity.getPlatformCommission(),
                entity.getMpCommission(),
                entity.getFreelancerAmount(),
                entity.getMpPaymentId(),
                entity.getMpPreferenceId(),
                entity.getStatus()
        );
    }
}
