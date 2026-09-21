package achanvear.peru.payments.domain.repository;

import achanvear.peru.payments.domain.model.PaymentMethod;
import achanvear.peru.payments.domain.model.PaymentMethodId;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentMethodRepository {
    void save(PaymentMethod paymentMethod);
    Optional<PaymentMethod> findById(PaymentMethodId id);
    List<PaymentMethod> findByUserId(UUID userId);
    List<PaymentMethod> findActiveByUserId(UUID userId);
    Optional<PaymentMethod> findDefaultByUserId(UUID userId);
    Optional<PaymentMethod> findByMpCardId(String mpCardId);
    void delete(PaymentMethod paymentMethod);
}
