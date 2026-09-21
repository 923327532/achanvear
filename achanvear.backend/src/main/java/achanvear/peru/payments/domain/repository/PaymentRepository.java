package achanvear.peru.payments.domain.repository;

import achanvear.peru.payments.domain.model.Payment;
import achanvear.peru.payments.domain.model.PaymentId;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository {
    void save(Payment payment);
    Optional<Payment> findById(PaymentId id);
    Optional<Payment> findByMpPaymentId(String mpPaymentId);
    boolean existsByMpPaymentId(String mpPaymentId);

    // Wallet summary queries
    BigDecimal getTotalFreelancerAmountByUserId(UUID freelancerUserId);
    BigDecimal getTotalCommissionsByUserId(UUID userId);
}