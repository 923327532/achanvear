package achanvear.peru.payments.infrastructure.persistence;

import achanvear.peru.payments.domain.model.PayoutMethod;
import achanvear.peru.payments.domain.model.PayoutMethodId;
import org.springframework.stereotype.Component;

@Component
public class PayoutMethodMapper {

    public PayoutMethodJpaEntity toJpa(PayoutMethod domain) {
        PayoutMethodJpaEntity entity = new PayoutMethodJpaEntity();
        entity.setId(domain.getId().value());
        entity.setUserId(domain.getUserId());
        entity.setProvider(domain.getProvider());
        entity.setCardToken(domain.getCardToken());
        entity.setMaskedCard(domain.getMaskedCard());
        entity.setCardBrand(domain.getCardBrand());
        entity.setLastFourDigits(domain.getLastFourDigits());
        entity.setAccountHolderName(domain.getAccountHolderName());
        entity.setDefault(domain.isDefault());
        entity.setActive(domain.isActive());
        return entity;
    }

    public PayoutMethod toDomain(PayoutMethodJpaEntity entity) {
        return new PayoutMethod(
                new PayoutMethodId(entity.getId()),
                entity.getUserId(),
                entity.getProvider(),
                entity.getCardToken(),
                entity.getMaskedCard(),
                entity.getCardBrand(),
                entity.getLastFourDigits(),
                entity.getAccountHolderName(),
                entity.isDefault(),
                entity.isActive()
        );
    }
}
