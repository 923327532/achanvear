package achanvear.peru.payments.domain.model;

import achanvear.peru.shared.domain.AggregateRoot;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Solicitud de retiro (dispersión de fondos) hacia el método de retiro del profesional.
 *
 * <p>Al solicitarse un retiro, el saldo disponible se reserva (descuenta) de la wallet
 * y se registra un movimiento de tipo WITHDRAWAL en el ledger. Solo cuando el proveedor
 * confirma el desembolso el retiro pasa a COMPLETED; si falla, el saldo se reembolsa.
 */
public class Payout extends AggregateRoot<PayoutId> {

    private final PayoutId id;
    private final UUID userId;
    private final UUID walletId;
    private final UUID payoutMethodId;
    private final BigDecimal amount;
    private final String idempotencyKey;
    private PayoutStatus status;
    private String externalDisbursementId;
    private String failureReason;
    private Instant requestedAt;
    private Instant completedAt;
    private Instant failedAt;
    private Instant cancelledAt;
    private Instant createdAt;
    private Instant updatedAt;

    public Payout(
            PayoutId id,
            UUID userId,
            UUID walletId,
            UUID payoutMethodId,
            BigDecimal amount,
            String idempotencyKey,
            PayoutStatus status,
            String externalDisbursementId,
            String failureReason,
            Instant requestedAt,
            Instant completedAt,
            Instant failedAt,
            Instant cancelledAt
    ) {
        this.id = id;
        this.userId = userId;
        this.walletId = walletId;
        this.payoutMethodId = payoutMethodId;
        this.amount = amount;
        this.idempotencyKey = idempotencyKey;
        this.status = status;
        this.externalDisbursementId = externalDisbursementId;
        this.failureReason = failureReason;
        this.requestedAt = requestedAt;
        this.completedAt = completedAt;
        this.failedAt = failedAt;
        this.cancelledAt = cancelledAt;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    public static Payout create(
            UUID userId,
            UUID walletId,
            UUID payoutMethodId,
            BigDecimal amount,
            String idempotencyKey
    ) {
        Instant now = Instant.now();
        return new Payout(
                new PayoutId(UUID.randomUUID()),
                userId,
                walletId,
                payoutMethodId,
                amount,
                idempotencyKey,
                PayoutStatus.REQUESTED,
                null,
                null,
                now,
                null,
                null,
                null
        );
    }

    public void markProcessing(String externalDisbursementId) {
        if (isTerminal()) {
            throw new IllegalStateException("Payout already in terminal state: " + status);
        }
        this.status = PayoutStatus.PROCESSING;
        this.externalDisbursementId = externalDisbursementId;
        this.updatedAt = Instant.now();
    }

    public void complete() {
        if (isTerminal()) {
            throw new IllegalStateException("Payout already in terminal state: " + status);
        }
        this.status = PayoutStatus.COMPLETED;
        this.completedAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public void fail(String reason) {
        if (isTerminal()) {
            throw new IllegalStateException("Payout already in terminal state: " + status);
        }
        this.status = PayoutStatus.FAILED;
        this.failureReason = reason;
        this.failedAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public void cancel() {
        if (isTerminal()) {
            throw new IllegalStateException("Payout already in terminal state: " + status);
        }
        this.status = PayoutStatus.CANCELLED;
        this.cancelledAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public boolean isTerminal() {
        return status == PayoutStatus.COMPLETED
                || status == PayoutStatus.FAILED
                || status == PayoutStatus.CANCELLED;
    }

    public boolean canRequestRefresh() {
        return status == PayoutStatus.PROCESSING || status == PayoutStatus.REQUESTED;
    }

    // Getters
    public PayoutId getId() { return id; }
    public UUID getUserId() { return userId; }
    public UUID getWalletId() { return walletId; }
    public UUID getPayoutMethodId() { return payoutMethodId; }
    public BigDecimal getAmount() { return amount; }
    public String getIdempotencyKey() { return idempotencyKey; }
    public PayoutStatus getStatus() { return status; }
    public String getExternalDisbursementId() { return externalDisbursementId; }
    public String getFailureReason() { return failureReason; }
    public Instant getRequestedAt() { return requestedAt; }
    public Instant getCompletedAt() { return completedAt; }
    public Instant getFailedAt() { return failedAt; }
    public Instant getCancelledAt() { return cancelledAt; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
