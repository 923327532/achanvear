package achanvear.peru.payments.application.service;

import achanvear.peru.payments.domain.model.AuditLog;
import achanvear.peru.payments.domain.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Servicio para registrar logs de auditoría de todas las operaciones de pago.
 */
@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(
            UUID userId,
            String action,
            String entityType,
            String entityId,
            String oldValue,
            String newValue,
            String ipAddress,
            String userAgent,
            String metadata
    ) {
        AuditLog auditLog = AuditLog.create(
                userId,
                action,
                entityType,
                entityId,
                oldValue,
                newValue,
                ipAddress,
                userAgent,
                metadata
        );
        auditLogRepository.save(auditLog);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logPaymentCreated(UUID userId, String milestoneId, String amount, String ipAddress) {
        log(userId, "PAYMENT_CREATED", "MILESTONE", milestoneId,
                null, String.format("{\"amount\": %s}", amount),
                ipAddress, null, null);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logPaymentFunded(UUID userId, String milestoneId, String mpPaymentId, String ipAddress) {
        log(userId, "PAYMENT_FUNDED", "MILESTONE", milestoneId,
                null, String.format("{\"mpPaymentId\": \"%s\"}", mpPaymentId),
                ipAddress, null, null);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logPaymentReleased(UUID userId, String milestoneId, String amount, String ipAddress) {
        log(userId, "PAYMENT_RELEASED", "MILESTONE", milestoneId,
                null, String.format("{\"amount\": %s}", amount),
                ipAddress, null, null);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logPaymentRefunded(UUID userId, String milestoneId, String reason, String ipAddress) {
        log(userId, "PAYMENT_REFUNDED", "MILESTONE", milestoneId,
                null, String.format("{\"reason\": \"%s\"}", reason),
                ipAddress, null, null);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logDisputeOpened(UUID userId, String milestoneId, String reason, String ipAddress) {
        log(userId, "DISPUTE_OPENED", "MILESTONE", milestoneId,
                null, String.format("{\"reason\": \"%s\"}", reason),
                ipAddress, null, null);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logDisputeResolved(UUID userId, String milestoneId, String resolution, String ipAddress) {
        log(userId, "DISPUTE_RESOLVED", "MILESTONE", milestoneId,
                null, String.format("{\"resolution\": \"%s\"}", resolution),
                ipAddress, null, null);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logPaymentMethodAdded(UUID userId, String paymentMethodId, String paymentType, String ipAddress) {
        log(userId, "PAYMENT_METHOD_ADDED", "PAYMENT_METHOD", paymentMethodId,
                null, String.format("{\"type\": \"%s\"}", paymentType),
                ipAddress, null, null);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logPaymentMethodRemoved(UUID userId, String paymentMethodId, String ipAddress) {
        log(userId, "PAYMENT_METHOD_REMOVED", "PAYMENT_METHOD", paymentMethodId,
                null, null, ipAddress, null, null);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logFraudAlert(UUID userId, String milestoneId, int riskScore, String riskFactors, String ipAddress) {
        log(userId, "FRAUD_ALERT", "MILESTONE", milestoneId,
                null, String.format("{\"riskScore\": %d, \"riskFactors\": %s}", riskScore, riskFactors),
                ipAddress, null, null);
    }

    // === Wallet & Quick Recharge Audit Logs ===

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logWalletCreated(UUID userId, String walletId, String ipAddress) {
        log(userId, "WALLET_CREATED", "WALLET", walletId,
                null, null, ipAddress, null, null);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logQuickRechargeInitiated(UUID userId, String rechargeId, String method, String amount, String ipAddress) {
        log(userId, "QUICK_RECHARGE_INITIATED", "QUICK_RECHARGE", rechargeId,
                null, String.format("{\"method\": \"%s\", \"amount\": %s}", method, amount),
                ipAddress, null, null);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logQuickRechargeCompleted(UUID userId, String rechargeId, String amount, String ipAddress) {
        log(userId, "QUICK_RECHARGE_COMPLETED", "QUICK_RECHARGE", rechargeId,
                null, String.format("{\"amount\": %s}", amount),
                ipAddress, null, null);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logQuickRechargeFailed(UUID userId, String rechargeId, String reason, String ipAddress) {
        log(userId, "QUICK_RECHARGE_FAILED", "QUICK_RECHARGE", rechargeId,
                null, String.format("{\"reason\": \"%s\"}", reason),
                ipAddress, null, null);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logLocalPaymentMethodAdded(UUID userId, String methodId, String methodType, String ipAddress) {
        log(userId, "LOCAL_PAYMENT_METHOD_ADDED", "LOCAL_PAYMENT_METHOD", methodId,
                null, String.format("{\"type\": \"%s\"}", methodType),
                ipAddress, null, null);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logLocalPaymentMethodRemoved(UUID userId, String methodId, String methodType, String ipAddress) {
        log(userId, "LOCAL_PAYMENT_METHOD_REMOVED", "LOCAL_PAYMENT_METHOD", methodId,
                null, String.format("{\"type\": \"%s\"}", methodType),
                ipAddress, null, null);
    }

    // === Payout / Retiros (Izipay Dispersión) ===

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logPayoutMethodAdded(UUID userId, String methodId, String maskedCard, String ipAddress) {
        log(userId, "PAYOUT_METHOD_ADDED", "PAYOUT_METHOD", methodId,
                null, String.format("{\"maskedCard\": \"%s\"}", maskedCard),
                ipAddress, null, null);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logPayoutMethodRemoved(UUID userId, String methodId, String ipAddress) {
        log(userId, "PAYOUT_METHOD_REMOVED", "PAYOUT_METHOD", methodId,
                null, null, ipAddress, null, null);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logPayoutRequested(UUID userId, String payoutId, String amount, String maskedCard, String ipAddress) {
        log(userId, "PAYOUT_REQUESTED", "PAYOUT", payoutId,
                null, String.format("{\"amount\": %s, \"maskedCard\": \"%s\"}", amount, maskedCard),
                ipAddress, null, null);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logPayoutCompleted(UUID userId, String payoutId, String externalId, String ipAddress) {
        log(userId, "PAYOUT_COMPLETED", "PAYOUT", payoutId,
                null, String.format("{\"externalDisbursementId\": \"%s\"}", externalId),
                ipAddress, null, null);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logPayoutFailed(UUID userId, String payoutId, String reason, String ipAddress) {
        log(userId, "PAYOUT_FAILED", "PAYOUT", payoutId,
                null, String.format("{\"reason\": \"%s\"}", reason),
                ipAddress, null, null);
    }
}
