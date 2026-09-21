package achanvear.peru.payments.infrastructure.persistence;

import achanvear.peru.payments.domain.model.Milestone;
import achanvear.peru.payments.domain.model.MilestoneId;
import org.springframework.stereotype.Component;

@Component
public class MilestoneMapper {

    public MilestoneJpaEntity toEntity(Milestone milestone) {
        MilestoneJpaEntity entity = new MilestoneJpaEntity();
        entity.setId(milestone.getId().value());
        entity.setProjectId(milestone.getProjectId());
        entity.setClientUserId(milestone.getClientUserId());
        entity.setFreelancerUserId(milestone.getFreelancerUserId());
        entity.setTitle(milestone.getTitle());
        entity.setDescription(milestone.getDescription());
        entity.setAmount(milestone.getAmount());
        entity.setStatus(milestone.getStatus());
        entity.setMpPreferenceId(milestone.getMpPreferenceId());
        entity.setMpPaymentId(milestone.getMpPaymentId());
        entity.setFundedAt(milestone.getFundedAt());
        entity.setReleasedAt(milestone.getReleasedAt());
        return entity;
    }

    public Milestone toDomain(MilestoneJpaEntity entity) {
        return new Milestone(
                new MilestoneId(entity.getId()),
                entity.getProjectId(),
                entity.getClientUserId(),
                entity.getFreelancerUserId(),
                entity.getTitle(),
                entity.getDescription(),
                entity.getAmount()
        );
    }
}
