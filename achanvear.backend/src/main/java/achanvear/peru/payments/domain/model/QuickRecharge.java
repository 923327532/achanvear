package achanvear.peru.payments.domain.model;

import achanvear.peru.shared.domain.AggregateRoot;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class QuickRecharge extends AggregateRoot<QuickRechargeId> {

    private final QuickRechargeId id;
    private final UUID userId;
    private final UUID walletId;
    private final BigDecimal amount;
    private final String method; // YAPE, PLIN, MP_WALLET, DEBIT_CARD, CREDIT_CARD
    private String referenceCode;
    private String phoneNumber;
    private QuickRechargeStatus status;
    private String mpPaymentId;
    private Instant completedAt;
    private Instant failedAt;
    private String failureReason;
    private Instant createdAt;
    private Instant updatedAt;

    public QuickRecharge(
            QuickRechargeId id,
            UUID userId,
            UUID walletId,
            BigDecimal amount,
            String method,
            String referenceCode,
            String phoneNumber,
            QuickRechargeStatus status,
            String mpPaymentId
    ) {
        this.id = id;
        this.userId = userId;
        this.walletId = walletId;
        this.amount = amount;
        this.method = method;
        this.referenceCode = referenceCode;
        this.phoneNumber = phoneNumber;
        this.status = status;
        this.mpPaymentId = mpPaymentId;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    public static QuickRecharge create(
            UUID userId,
            UUID walletId,
            BigDecimal amount,
            String method,
            String phoneNumber
    ) {
        return new QuickRecharge(
                new QuickRechargeId(UUID.randomUUID()),
                userId,
                walletId,
                amount,
                method,
                null,
                phoneNumber,
                QuickRechargeStatus.PENDING,
                null
        );
    }

    /**
     * Marca la recarga como completada.
     */
    public void complete(String referenceCode) {
        if (this.status != QuickRechargeStatus.PENDING) {
            throw new IllegalStateException("Quick recharge can only be completed from PENDING status");
        }
        this.status = QuickRechargeStatus.COMPLETED;
        this.referenceCode = referenceCode;
        this.completedAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    /**
     * Marca la recarga como fallida.
     */
    public void fail(String reason) {
        if (this.status != QuickRechargeStatus.PENDING) {
            throw new IllegalStateException("Quick recharge can only be failed from PENDING status");
        }
        this.status = QuickRechargeStatus.FAILED;
        this.failureReason = reason;
        this.failedAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    /**
     * Marca la recarga como expirada.
     */
    public void expire() {
        if (this.status != QuickRechargeStatus.PENDING) {
            throw new IllegalStateException("Quick recharge can only be expired from PENDING status");
        }
        this.status = QuickRechargeStatus.EXPIRED;
        this.updatedAt = Instant.now();
    }

    /**
     * Asocia un pago de Mercado Pago a esta recarga.
     */
    public void linkMpPayment(String mpPaymentId) {
        this.mpPaymentId = mpPaymentId;
        this.updatedAt = Instant.now();
    }

    // Getters
    public QuickRechargeId getId() { return id; }
    public UUID getUserId() { return userId; }
    public UUID getWalletId() { return walletId; }
    public BigDecimal getAmount() { return amount; }
    public String getMethod() { return method; }
    public String getReferenceCode() { return referenceCode; }
    public String getPhoneNumber() { return phoneNumber; }
    public QuickRechargeStatus getStatus() { return status; }
    public String getMpPaymentId() { return mpPaymentId; }
    public Instant getCompletedAt() { return completedAt; }
    public Instant getFailedAt() { return failedAt; }
    public String getFailureReason() { return failureReason; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
