package achanvear.peru.payments.domain.model;

import achanvear.peru.shared.domain.AggregateRoot;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class Wallet extends AggregateRoot<WalletId> {

    private final WalletId id;
    private final UUID userId;
    private BigDecimal balance;
    private BigDecimal totalDeposited;
    private BigDecimal totalWithdrawn;
    private BigDecimal totalSpent;
    private String currency;
    private boolean isActive;
    private Instant createdAt;
    private Instant updatedAt;

    public Wallet(
            WalletId id,
            UUID userId,
            BigDecimal balance,
            BigDecimal totalDeposited,
            BigDecimal totalWithdrawn,
            BigDecimal totalSpent,
            String currency,
            boolean isActive
    ) {
        this.id = id;
        this.userId = userId;
        this.balance = balance;
        this.totalDeposited = totalDeposited;
        this.totalWithdrawn = totalWithdrawn;
        this.totalSpent = totalSpent;
        this.currency = currency;
        this.isActive = isActive;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    public static Wallet create(UUID userId) {
        return new Wallet(
                new WalletId(UUID.randomUUID()),
                userId,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                "PEN",
                true
        );
    }

    /**
     * Deposita fondos en la wallet (recarga rápida).
     */
    public void deposit(BigDecimal amount) {
        if (!isActive) {
            throw new IllegalStateException("Wallet is inactive");
        }
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Deposit amount must be positive");
        }
        this.balance = this.balance.add(amount);
        this.totalDeposited = this.totalDeposited.add(amount);
        this.updatedAt = Instant.now();
    }

    /**
     * Retira fondos de la wallet.
     */
    public void withdraw(BigDecimal amount) {
        if (!isActive) {
            throw new IllegalStateException("Wallet is inactive");
        }
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Withdrawal amount must be positive");
        }
        if (this.balance.compareTo(amount) < 0) {
            throw new IllegalStateException("Insufficient balance");
        }
        this.balance = this.balance.subtract(amount);
        this.totalWithdrawn = this.totalWithdrawn.add(amount);
        this.updatedAt = Instant.now();
    }

    /**
     * Gasta fondos de la wallet (pago de milestone).
     */
    public void spend(BigDecimal amount) {
        if (!isActive) {
            throw new IllegalStateException("Wallet is inactive");
        }
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Spend amount must be positive");
        }
        if (this.balance.compareTo(amount) < 0) {
            throw new IllegalStateException("Insufficient balance");
        }
        this.balance = this.balance.subtract(amount);
        this.totalSpent = this.totalSpent.add(amount);
        this.updatedAt = Instant.now();
    }

    /**
     * Reembolsa fondos a la wallet.
     */
    public void refund(BigDecimal amount) {
        if (!isActive) {
            throw new IllegalStateException("Wallet is inactive");
        }
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Refund amount must be positive");
        }
        this.balance = this.balance.add(amount);
        this.updatedAt = Instant.now();
    }

    public void deactivate() {
        this.isActive = false;
        this.updatedAt = Instant.now();
    }

    public void activate() {
        this.isActive = true;
        this.updatedAt = Instant.now();
    }

    // Getters
    public WalletId getId() { return id; }
    public UUID getUserId() { return userId; }
    public BigDecimal getBalance() { return balance; }
    public BigDecimal getTotalDeposited() { return totalDeposited; }
    public BigDecimal getTotalWithdrawn() { return totalWithdrawn; }
    public BigDecimal getTotalSpent() { return totalSpent; }
    public String getCurrency() { return currency; }
    public boolean isActive() { return isActive; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
