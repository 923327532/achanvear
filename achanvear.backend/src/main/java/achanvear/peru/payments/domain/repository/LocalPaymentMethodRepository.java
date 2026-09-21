package achanvear.peru.payments.domain.repository;

import achanvear.peru.payments.domain.model.LocalPaymentMethod;
import achanvear.peru.payments.domain.model.LocalPaymentMethodId;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LocalPaymentMethodRepository {
    void save(LocalPaymentMethod method);
    Optional<LocalPaymentMethod> findById(LocalPaymentMethodId id);
    List<LocalPaymentMethod> findByUserId(UUID userId);
    List<LocalPaymentMethod> findByUserIdAndMethodType(UUID userId, String methodType);
    Optional<LocalPaymentMethod> findDefaultByUserId(UUID userId);
    void delete(LocalPaymentMethod method);
}
