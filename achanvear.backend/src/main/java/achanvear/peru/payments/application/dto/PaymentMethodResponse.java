package achanvear.peru.payments.application.dto;

public record PaymentMethodResponse(
        String id,
        String paymentType,
        String lastFourDigits,
        String cardholderName,
        String expirationDate,
        String issuerName,
        boolean isDefault,
        boolean isActive,
        String createdAt
) {
}
