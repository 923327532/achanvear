package achanvear.peru.payments.infrastructure.persistence;

import achanvear.peru.shared.infrastructure.BaseJpaEntity;
import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "payment_methods")
public class PaymentMethodJpaEntity extends BaseJpaEntity {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "mp_card_id", length = 100)
    private String mpCardId;

    @Column(name = "mp_payer_id", length = 100)
    private String mpPayerId;

    @Column(name = "payment_type", nullable = false, length = 50)
    private String paymentType;

    @Column(name = "last_four_digits", length = 4)
    private String lastFourDigits;

    @Column(name = "cardholder_name", length = 200)
    private String cardholderName;

    @Column(name = "expiration_date", length = 7)
    private String expirationDate;

    @Column(name = "issuer_name", length = 200)
    private String issuerName;

    @Column(name = "is_default", nullable = false)
    private boolean isDefault;

    @Column(name = "is_active", nullable = false)
    private boolean isActive;

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getMpCardId() { return mpCardId; }
    public void setMpCardId(String mpCardId) { this.mpCardId = mpCardId; }

    public String getMpPayerId() { return mpPayerId; }
    public void setMpPayerId(String mpPayerId) { this.mpPayerId = mpPayerId; }

    public String getPaymentType() { return paymentType; }
    public void setPaymentType(String paymentType) { this.paymentType = paymentType; }

    public String getLastFourDigits() { return lastFourDigits; }
    public void setLastFourDigits(String lastFourDigits) { this.lastFourDigits = lastFourDigits; }

    public String getCardholderName() { return cardholderName; }
    public void setCardholderName(String cardholderName) { this.cardholderName = cardholderName; }

    public String getExpirationDate() { return expirationDate; }
    public void setExpirationDate(String expirationDate) { this.expirationDate = expirationDate; }

    public String getIssuerName() { return issuerName; }
    public void setIssuerName(String issuerName) { this.issuerName = issuerName; }

    public boolean isDefault() { return isDefault; }
    public void setDefault(boolean isDefault) { this.isDefault = isDefault; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean isActive) { this.isActive = isActive; }
}
