package achanvear.peru.payments.infrastructure.persistence;

import achanvear.peru.payments.domain.model.PlanType;
import achanvear.peru.payments.domain.model.Subscription;
import achanvear.peru.payments.domain.model.SubscriptionId;
import org.springframework.stereotype.Component;

@Component
public class SubscriptionMapper {

    public SubscriptionJpaEntity toEntity(Subscription subscription) {
        SubscriptionJpaEntity entity = new SubscriptionJpaEntity();
        entity.setId(subscription.getId().value());
        entity.setCompanyUserId(subscription.getCompanyUserId());
        entity.setPlan(subscription.getPlan().name());
        entity.setStatus(subscription.getStatus());
        entity.setStartDate(subscription.getStartDate());
        entity.setEndDate(subscription.getEndDate());
        entity.setMpSubscriptionId(subscription.getMpSubscriptionId());
        return entity;
    }

    public Subscription toDomain(SubscriptionJpaEntity entity) {
        return new Subscription(
                new SubscriptionId(entity.getId()),
                entity.getCompanyUserId(),
                PlanType.valueOf(entity.getPlan()),
                entity.getStartDate(),
                entity.getEndDate(),
                entity.getMpSubscriptionId()
        );
    }
}