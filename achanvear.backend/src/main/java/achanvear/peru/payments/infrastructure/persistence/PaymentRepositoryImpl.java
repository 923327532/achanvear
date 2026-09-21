package achanvear.peru.payments.infrastructure.persistence;

import achanvear.peru.payments.domain.model.Payment;
import achanvear.peru.payments.domain.model.PaymentId;
import achanvear.peru.payments.domain.repository.PaymentRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

@Repository
public class PaymentRepositoryImpl implements PaymentRepository {

    private final PaymentJpaRepository jpaRepository;
    private final PaymentMapper mapper;

    public PaymentRepositoryImpl(PaymentJpaRepository jpaRepository, PaymentMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public void save(Payment payment) {
        jpaRepository.save(mapper.toEntity(payment));
    }

    @Override
    public Optional<Payment> findById(PaymentId id) {
        return jpaRepository.findById(id.value()).map(mapper::toDomain);
    }

    @Override
    public Optional<Payment> findByMpPaymentId(String mpPaymentId) {
        return jpaRepository.findByMpPaymentId(mpPaymentId).map(mapper::toDomain);
    }

    @Override
    public boolean existsByMpPaymentId(String mpPaymentId) {
        return jpaRepository.existsByMpPaymentId(mpPaymentId);
    }

    @Override
    public BigDecimal getTotalFreelancerAmountByUserId(UUID freelancerUserId) {
        return jpaRepository.getTotalFreelancerAmountByUserId(freelancerUserId);
    }

    @Override
    public BigDecimal getTotalCommissionsByUserId(UUID userId) {
        return jpaRepository.getTotalCommissionsByUserId(userId);
    }
}