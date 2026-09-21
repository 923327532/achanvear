package achanvear.peru.payments.domain.model;

import achanvear.peru.shared.domain.AggregateRoot;

import java.time.Instant;
import java.util.UUID;

/**
 * Método de retiro del profesional: tarjeta bancaria tokenizada.
 *
 * <p>Reglas de seguridad: Tiyuy NUNCA almacena el número completo de la tarjeta
 * ni el CVV. Solo se guarda el token del proveedor, la tarjeta enmascarada
 * (p. ej. "•••• •••• •••• 4821"), la marca y los últimos 4 dígitos.
 */
public class PayoutMethod extends AggregateRoot<PayoutMethodId> {

    private final PayoutMethodId id;
    private final UUID userId;
    private final String provider; // IZIPAY
    private final String cardToken;
    private final String maskedCard;
    private final String cardBrand;
    private final String lastFourDigits;
    private final String accountHolderName;
    private boolean isDefault;
    private boolean isActive;
    private Instant createdAt;
    private Instant updatedAt;

    public PayoutMethod(
            PayoutMethodId id,
            UUID userId,
            String provider,
            String cardToken,
            String maskedCard,
            String cardBrand,
            String lastFourDigits,
            String accountHolderName,
            boolean isDefault,
            boolean isActive
    ) {
        this.id = id;
        this.userId = userId;
        this.provider = provider;
        this.cardToken = cardToken;
        this.maskedCard = maskedCard;
        this.cardBrand = cardBrand;
        this.lastFourDigits = lastFourDigits;
        this.accountHolderName = accountHolderName;
        this.isDefault = isDefault;
        this.isActive = isActive;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    public static PayoutMethod create(
            UUID userId,
            String provider,
            String cardToken,
            String maskedCard,
            String cardBrand,
            String lastFourDigits,
            String accountHolderName
    ) {
        if (lastFourDigits == null || !lastFourDigits.matches("\\d{4}")) {
            throw new IllegalArgumentException("Se requieren los últimos 4 dígitos de la tarjeta");
        }
        if (maskedCard == null || maskedCard.isBlank()) {
            throw new IllegalArgumentException("Se requiere la tarjeta enmascarada");
        }
        return new PayoutMethod(
                new PayoutMethodId(UUID.randomUUID()),
                userId,
                provider,
                cardToken,
                maskedCard,
                cardBrand,
                lastFourDigits,
                accountHolderName,
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
    public PayoutMethodId getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getProvider() { return provider; }
    public String getCardToken() { return cardToken; }
    public String getMaskedCard() { return maskedCard; }
    public String getCardBrand() { return cardBrand; }
    public String getLastFourDigits() { return lastFourDigits; }
    public String getAccountHolderName() { return accountHolderName; }
    public boolean isDefault() { return isDefault; }
    public boolean isActive() { return isActive; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
