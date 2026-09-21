package achanvear.peru.payments.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

public interface PaymentJpaRepository extends JpaRepository<PaymentJpaEntity, UUID> {
    Optional<PaymentJpaEntity> findByMpPaymentId(String mpPaymentId);
    boolean existsByMpPaymentId(String mpPaymentId);

    @Query("SELECT SUM(p.freelancerAmount) FROM PaymentJpaEntity p WHERE p.freelancerUserId = :userId AND p.status = 'APPROVED'")
    BigDecimal getTotalFreelancerAmountByUserId(@Param("userId") UUID userId);

    @Query("SELECT SUM(p.platformCommission) FROM PaymentJpaEntity p WHERE (p.freelancerUserId = :userId OR p.clientUserId = :userId) AND p.status = 'APPROVED'")
    BigDecimal getTotalCommissionsByUserId(@Param("userId") UUID userId);
}