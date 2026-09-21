package achanvear.peru.payments.domain.model;

import achanvear.peru.shared.domain.AggregateRoot;

import java.time.Instant;
import java.util.UUID;

public class PaymentMethod extends AggregateRoot<PaymentMethodId> {

    private final PaymentMethodId id;
    private final UUID userId;
    private final String mpCardId;
    private final String mpPayerId;
    private final String paymentType;
    private final String lastFourDigits;
    private final String cardholderName;
    private final String expirationDate;
    private final String issuerName;
    private boolean isDefault;
    private boolean isActive;
    private Instant createdAt;
    private Instant updatedAt;

    public PaymentMethod(
            PaymentMethodId id,
            UUID userId,
            String mpCardId,
            String mpPayerId,
            String paymentType,
            String lastFourDigits,
            String cardholderName,
            String expirationDate,
            String issuerName,
            boolean isDefault,
            boolean isActive
    ) {
        this.id = id;
        this.userId = userId;
        this.mpCardId = mpCardId;
        this.mpPayerId = mpPayerId;
        this.paymentType = paymentType;
        this.lastFourDigits = lastFourDigits;
        this.cardholderName = cardholderName;
        this.expirationDate = expirationDate;
        this.issuerName = issuerName;
        this.isDefault = isDefault;
        this.isActive = isActive;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    public static PaymentMethod create(
            UUID userId,
            String mpCardId,
            String mpPayerId,
            String paymentType,
            String lastFourDigits,
            String cardholderName,
            String expirationDate,
            String issuerName
    ) {
        return new PaymentMethod(
                new PaymentMethodId(UUID.randomUUID()),
                userId,
                mpCardId,
                mpPayerId,
                paymentType,
                lastFourDigits,
                cardholderName,
                expirationDate,
                issuerName,
                false,
                true
        );
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
    public PaymentMethodId getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getMpCardId() { return mpCardId; }
    public String getMpPayerId() { return mpPayerId; }
    public String getPaymentType() { return paymentType; }
    public String getLastFourDigits() { return lastFourDigits; }
    public String getCardholderName() { return cardholderName; }
    public String getExpirationDate() { return expirationDate; }
    public String getIssuerName() { return issuerName; }
    public boolean isDefault() { return isDefault; }
    public boolean isActive() { return isActive; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
