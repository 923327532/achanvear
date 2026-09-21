package achanvear.peru.payments.domain.repository;

import achanvear.peru.payments.domain.model.PayoutMethod;
import achanvear.peru.payments.domain.model.PayoutMethodId;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PayoutMethodRepository {

    void save(PayoutMethod method);

    Optional<PayoutMethod> findById(PayoutMethodId id);

    List<PayoutMethod> findByUserId(UUID userId);

    Optional<PayoutMethod> findDefaultByUserId(UUID userId);

    List<PayoutMethod> findByUserIdAndActiveTrue(UUID userId);

    void delete(PayoutMethod method);
}
