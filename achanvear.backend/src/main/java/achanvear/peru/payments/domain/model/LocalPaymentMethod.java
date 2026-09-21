package achanvear.peru.payments.domain.model;

import achanvear.peru.shared.domain.AggregateRoot;

import java.time.Instant;
import java.util.UUID;

/**
 * Método de pago local peruano (Yape, Plin).
 */
public class LocalPaymentMethod extends AggregateRoot<LocalPaymentMethodId> {

    private final LocalPaymentMethodId id;
    private final UUID userId;
    private final String methodType; // YAPE, PLIN
    private final String phoneNumber;
    private final String accountHolderName;
    private boolean isVerified;
    private boolean isDefault;
    private boolean isActive;
    private Instant createdAt;
    private Instant updatedAt;

    public LocalPaymentMethod(
            LocalPaymentMethodId id,
            UUID userId,
            String methodType,
            String phoneNumber,
            String accountHolderName,
            boolean isVerified,
            boolean isDefault,
            boolean isActive
    ) {
        this.id = id;
        this.userId = userId;
        this.methodType = methodType;
        this.phoneNumber = phoneNumber;
        this.accountHolderName = accountHolderName;
        this.isVerified = isVerified;
        this.isDefault = isDefault;
        this.isActive = isActive;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    public static LocalPaymentMethod create(
            UUID userId,
            String methodType,
            String phoneNumber,
            String accountHolderName
    ) {
        return new LocalPaymentMethod(
                new LocalPaymentMethodId(UUID.randomUUID()),
                userId,
                methodType,
                phoneNumber,
                accountHolderName,
                false,
                false,
                true
        );
    }

    public void markAsVerified() {
        this.isVerified = true;
        this.updatedAt = Instant.now();
    }

    public void markAsDefault() {
        this.isDefault = true;
        this.updatedAt = Instant.now();
    }

    public void unmarkAsDefault() {
        this.isDefault = false;
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
    public LocalPaymentMethodId getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getMethodType() { return methodType; }
    public String getPhoneNumber() { return phoneNumber; }
    public String getAccountHolderName() { return accountHolderName; }
    public boolean isVerified() { return isVerified; }
    public boolean isDefault() { return isDefault; }
    public boolean isActive() { return isActive; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
