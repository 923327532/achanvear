package achanvear.peru.payments.domain.model;

import achanvear.peru.shared.domain.AggregateRoot;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class WalletTransaction extends AggregateRoot<WalletTransactionId> {

    private final WalletTransactionId id;
    private final UUID walletId;
    private final UUID userId;
    private final String type; // DEPOSIT, WITHDRAWAL, PAYMENT, REFUND, COMMISSION
    private final BigDecimal amount;
    private final BigDecimal balanceBefore;
    private final BigDecimal balanceAfter;
    private final String referenceType; // QUICK_RECHARGE, MILESTONE, ESCROW, MP_PAYMENT
    private final String referenceId;
    private final String description;
    private final String status;
    private final Instant createdAt;

    public WalletTransaction(
            WalletTransactionId id,
            UUID walletId,
            UUID userId,
            String type,
            BigDecimal amount,
            BigDecimal balanceBefore,
            BigDecimal balanceAfter,
            String referenceType,
            String referenceId,
            String description,
            String status
    ) {
        this.id = id;
        this.walletId = walletId;
        this.userId = userId;
        this.type = type;
        this.amount = amount;
        this.balanceBefore = balanceBefore;
        this.balanceAfter = balanceAfter;
        this.referenceType = referenceType;
        this.referenceId = referenceId;
        this.description = description;
        this.status = status;
        this.createdAt = Instant.now();
    }

    public static WalletTransaction createDeposit(
            UUID walletId,
            UUID userId,
            BigDecimal amount,
            BigDecimal balanceBefore,
            BigDecimal balanceAfter,
            String referenceType,
            String referenceId,
            String description
    ) {
        return new WalletTransaction(
                new WalletTransactionId(UUID.randomUUID()),
                walletId,
                userId,
                "DEPOSIT",
                amount,
                balanceBefore,
                balanceAfter,
                referenceType,
                referenceId,
                description,
                "COMPLETED"
        );
    }

    public static WalletTransaction createPayment(
            UUID walletId,
            UUID userId,
            BigDecimal amount,
            BigDecimal balanceBefore,
            BigDecimal balanceAfter,
            String referenceType,
            String referenceId,
            String description
    ) {
        return new WalletTransaction(
                new WalletTransactionId(UUID.randomUUID()),
                walletId,
                userId,
                "PAYMENT",
                amount,
                balanceBefore,
                balanceAfter,
                referenceType,
                referenceId,
                description,
                "COMPLETED"
        );
    }

    public static WalletTransaction createRefund(
            UUID walletId,
            UUID userId,
            BigDecimal amount,
            BigDecimal balanceBefore,
            BigDecimal balanceAfter,
            String referenceType,
            String referenceId,
            String description
    ) {
        return new WalletTransaction(
                new WalletTransactionId(UUID.randomUUID()),
                walletId,
                userId,
                "REFUND",
                amount,
                balanceBefore,
                balanceAfter,
                referenceType,
                referenceId,
                description,
                "COMPLETED"
        );
    }

    public static WalletTransaction createWithdrawal(
            UUID walletId,
            UUID userId,
            BigDecimal amount,
            BigDecimal balanceBefore,
            BigDecimal balanceAfter,
            String referenceType,
            String referenceId,
            String description,
            String status
    ) {
        return new WalletTransaction(
                new WalletTransactionId(UUID.randomUUID()),
                walletId,
                userId,
                "WITHDRAWAL",
                amount,
                balanceBefore,
                balanceAfter,
                referenceType,
                referenceId,
                description,
                status
        );
    }

    // Getters
    public WalletTransactionId getId() { return id; }
    public UUID getWalletId() { return walletId; }
    public UUID getUserId() { return userId; }
    public String getType() { return type; }
    public BigDecimal getAmount() { return amount; }
    public BigDecimal getBalanceBefore() { return balanceBefore; }
    public BigDecimal getBalanceAfter() { return balanceAfter; }
    public String getReferenceType() { return referenceType; }
    public String getReferenceId() { return referenceId; }
    public String getDescription() { return description; }
    public String getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
}
