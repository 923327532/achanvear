package achanvear.peru.payments.application.service;

import achanvear.peru.payments.domain.model.Milestone;
import achanvear.peru.payments.domain.model.MilestoneStatus;
import achanvear.peru.payments.domain.repository.MilestoneRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.util.*;

/**
 * Servicio de detección de fraude para pagos.
 * Evalúa transacciones sospechosas basado en múltiples factores de riesgo.
 */
@Service
public class FraudDetectionService {

    private final MilestoneRepository milestoneRepository;

    // Umbrales de riesgo
    private static final BigDecimal MAX_AMOUNT_PER_TRANSACTION = new BigDecimal("50000.00");
    private static final int MAX_MILESTONES_PER_DAY = 10;
    private static final int MAX_FAILED_PAYMENTS_PER_HOUR = 5;
    private static final BigDecimal SUSPICIOUS_AMOUNT_THRESHOLD = new BigDecimal("10000.00");

    public FraudDetectionService(MilestoneRepository milestoneRepository) {
        this.milestoneRepository = milestoneRepository;
    }

    /**
     * Evalúa el riesgo de una transacción y devuelve un score y factores de riesgo.
     */
    public FraudAssessment assessTransaction(
            UUID clientUserId,
            UUID freelancerUserId,
            BigDecimal amount,
            String ipAddress,
            String userAgent
    ) {
        int riskScore = 0;
        List<String> riskFactors = new ArrayList<>();
        boolean requiresReview = false;

        // 1. Verificar monto máximo por transacción
        if (amount.compareTo(MAX_AMOUNT_PER_TRANSACTION) > 0) {
            riskScore += 30;
            riskFactors.add("AMOUNT_EXCEEDS_MAXIMUM");
            requiresReview = true;
        }

        // 2. Verificar monto sospechoso
        if (amount.compareTo(SUSPICIOUS_AMOUNT_THRESHOLD) > 0) {
            riskScore += 10;
            riskFactors.add("HIGH_AMOUNT");
        }

        // 3. Verificar frecuencia de milestones del cliente
        var clientMilestones = milestoneRepository.findByClientUserId(clientUserId);
        long milestonesToday = clientMilestones.stream()
                .filter(m -> m.getCreatedAt() != null &&
                        Duration.between(m.getCreatedAt(), Instant.now()).toHours() < 24)
                .count();
        if (milestonesToday > MAX_MILESTONES_PER_DAY) {
            riskScore += 25;
            riskFactors.add("TOO_MANY_MILESTONES_TODAY");
            requiresReview = true;
        }

        // 4. Verificar si el cliente tiene historial de disputas
        long disputedMilestones = clientMilestones.stream()
                .filter(m -> m.getStatus() == MilestoneStatus.DISPUTED)
                .count();
        if (disputedMilestones > 3) {
            riskScore += 20;
            riskFactors.add("HIGH_DISPUTE_RATE");
            requiresReview = true;
        }

        // 5. Verificar si el freelancer tiene historial de disputas
        var freelancerMilestones = milestoneRepository.findByFreelancerUserId(freelancerUserId);
        long freelancerDisputes = freelancerMilestones.stream()
                .filter(m -> m.getStatus() == MilestoneStatus.DISPUTED)
                .count();
        if (freelancerDisputes > 3) {
            riskScore += 15;
            riskFactors.add("FREELANCER_HIGH_DISPUTE_RATE");
            requiresReview = true;
        }

        // 6. Verificar si es la primera transacción entre cliente y freelancer
        boolean hasPreviousTransactions = clientMilestones.stream()
                .anyMatch(m -> m.getFreelancerUserId().equals(freelancerUserId) &&
                        m.getStatus() == MilestoneStatus.RELEASED);
        if (!hasPreviousTransactions) {
            riskScore += 5;
            riskFactors.add("FIRST_TRANSACTION_WITH_FREELANCER");
        }

        // 7. Verificar IP sospechosa (si se proporciona)
        if (ipAddress != null && isSuspiciousIp(ipAddress)) {
            riskScore += 20;
            riskFactors.add("SUSPICIOUS_IP");
            requiresReview = true;
        }

        // Determinar estado final
        FraudStatus status;
        if (riskScore >= 50) {
            status = FraudStatus.BLOCKED;
        } else if (riskScore >= 25) {
            status = FraudStatus.FLAGGED;
        } else {
            status = FraudStatus.APPROVED;
        }

        return new FraudAssessment(
                riskScore,
                status,
                riskFactors,
                requiresReview || status == FraudStatus.FLAGGED
        );
    }

    private boolean isSuspiciousIp(String ipAddress) {
        // Implementar lógica de IP sospechosa
        // Por ejemplo: VPN conocidos, proxies, IPs de países de alto riesgo
        // Por ahora retornamos false como placeholder
        return false;
    }

    public enum FraudStatus {
        APPROVED,    // Transacción segura
        FLAGGED,     // Requiere revisión manual
        BLOCKED      // Bloqueada automáticamente
    }

    public record FraudAssessment(
            int riskScore,
            FraudStatus status,
            List<String> riskFactors,
            boolean requiresReview
    ) {
        public boolean isApproved() {
            return status == FraudStatus.APPROVED;
        }

        public boolean isBlocked() {
            return status == FraudStatus.BLOCKED;
        }
    }
}
