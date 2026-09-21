package achanvear.peru.payments.domain.repository;

import achanvear.peru.payments.domain.model.Subscription;
import achanvear.peru.payments.domain.model.SubscriptionId;

import java.util.Optional;
import java.util.UUID;

public interface SubscriptionRepository {
    void save(Subscription subscription);
    Optional<Subscription> findById(SubscriptionId id);
    Optional<Subscription> findByCompanyUserId(UUID companyUserId);
    Optional<Subscription> findByMpSubscriptionId(String mpSubscriptionId);
}