package achanvear.peru.payments.domain.repository;

import achanvear.peru.payments.domain.model.Payout;
import achanvear.peru.payments.domain.model.PayoutId;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PayoutRepository {

    void save(Payout payout);

    Optional<Payout> findById(PayoutId id);

    Optional<Payout> findByIdempotencyKey(String idempotencyKey);

    List<Payout> findByUserId(UUID userId);
}
