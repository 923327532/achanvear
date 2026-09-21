package achanvear.peru.payments.infrastructure.persistence;

import achanvear.peru.payments.domain.model.LocalPaymentMethod;
import achanvear.peru.payments.domain.model.LocalPaymentMethodId;
import org.springframework.stereotype.Component;

@Component
public class LocalPaymentMethodMapper {

    public LocalPaymentMethodJpaEntity toJpa(LocalPaymentMethod domain) {
        LocalPaymentMethodJpaEntity entity = new LocalPaymentMethodJpaEntity();
        entity.setId(domain.getId().value());
        entity.setUserId(domain.getUserId());
        entity.setMethodType(domain.getMethodType());
        entity.setPhoneNumber(domain.getPhoneNumber());
        entity.setAccountHolderName(domain.getAccountHolderName());
        entity.setVerified(domain.isVerified());
        entity.setDefault(domain.isDefault());
        entity.setActive(domain.isActive());
        return entity;
    }

    public LocalPaymentMethod toDomain(LocalPaymentMethodJpaEntity entity) {
        return new LocalPaymentMethod(
                new LocalPaymentMethodId(entity.getId()),
                entity.getUserId(),
                entity.getMethodType(),
                entity.getPhoneNumber(),
                entity.getAccountHolderName(),
                entity.isVerified(),
                entity.isDefault(),
                entity.isActive()
        );
    }
}
