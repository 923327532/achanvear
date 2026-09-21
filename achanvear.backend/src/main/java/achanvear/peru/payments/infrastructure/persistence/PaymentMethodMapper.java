package achanvear.peru.payments.infrastructure.persistence;

import achanvear.peru.payments.domain.model.PaymentMethod;
import achanvear.peru.payments.domain.model.PaymentMethodId;
import org.springframework.stereotype.Component;

@Component
public class PaymentMethodMapper {

    public PaymentMethodJpaEntity toEntity(PaymentMethod paymentMethod) {
        PaymentMethodJpaEntity entity = new PaymentMethodJpaEntity();
        entity.setId(paymentMethod.getId().value());
        entity.setUserId(paymentMethod.getUserId());
        entity.setMpCardId(paymentMethod.getMpCardId());
        entity.setMpPayerId(paymentMethod.getMpPayerId());
        entity.setPaymentType(paymentMethod.getPaymentType());
        entity.setLastFourDigits(paymentMethod.getLastFourDigits());
        entity.setCardholderName(paymentMethod.getCardholderName());
        entity.setExpirationDate(paymentMethod.getExpirationDate());
        entity.setIssuerName(paymentMethod.getIssuerName());
        entity.setDefault(paymentMethod.isDefault());
        entity.setActive(paymentMethod.isActive());
        return entity;
    }

    public PaymentMethod toDomain(PaymentMethodJpaEntity entity) {
        return new PaymentMethod(
                new PaymentMethodId(entity.getId()),
                entity.getUserId(),
                entity.getMpCardId(),
                entity.getMpPayerId(),
                entity.getPaymentType(),
                entity.getLastFourDigits(),
                entity.getCardholderName(),
                entity.getExpirationDate(),
                entity.getIssuerName(),
                entity.isDefault(),
                entity.isActive()
        );
    }
}
