package achanvear.peru.payments.infrastructure.external;

import achanvear.peru.payments.domain.model.PlanType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Component
public class CulqiGateway {

    private final RestClient restClient;
    private final CulqiProperties properties;

    public CulqiGateway(CulqiProperties properties) {
        this.properties = properties;
        this.restClient = RestClient.builder()
                .baseUrl(properties.baseUrl())
                .defaultHeader("Authorization", "Bearer " + properties.secretKey())
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    public CulqiChargeResponse createCharge(
            BigDecimal amount,
            String token,
            String email,
            String milestoneId,
            String description
    ) {
        var request = new CulqiChargeRequest(
                toCents(amount),
                properties.currencyCode(),
                email,
                token,
                true,
                description,
                Map.of("milestoneId", milestoneId, "provider", "culqi")
        );

        return restClient.post()
                .uri("/charges")
                .body(request)
                .retrieve()
                .body(CulqiChargeResponse.class);
    }

    /**
     * Registra un cliente en Culqi para poder asociarle tarjetas (cargo one-click).
     * POST /customers
     */
    public CulqiCustomerResponse createCustomer(
            String firstName,
            String lastName,
            String email,
            String address,
            String phoneNumber
    ) {
        Map<String, Object> request = new LinkedHashMap<>();
        request.put("first_name", normalizeRequiredText(firstName, "Cliente", 2, 50));
        request.put("last_name", normalizeRequiredText(lastName, "Achanvear", 2, 50));
        request.put("email", normalizeRequiredText(email, "cliente@achanvear.com", 5, 80));
        request.put("address", normalizeRequiredText(address, "Lima, Peru", 3, 100));
        request.put("address_city", "Lima");
        request.put("country_code", "PE");

        String normalizedPhone = normalizeOptionalText(phoneNumber, 5, 20);
        if (normalizedPhone != null) {
            request.put("phone_number", normalizedPhone);
        }

        return restClient.post()
                .uri("/customers")
                .body(request)
                .retrieve()
                .body(CulqiCustomerResponse.class);
    }

    /**
     * Registra una tarjeta a partir del token generado por Culqi Checkout.
     * POST /cards
     */
    public CulqiCardResponse createCard(String customerId, String tokenId) {
        var request = new CulqiCardRequest(customerId, tokenId);

        return restClient.post()
                .uri("/cards")
                .body(request)
                .retrieve()
                .body(CulqiCardResponse.class);
    }

    /**
     * Cobra una suscripción a plan de empresa con la tarjeta tokenizada por Culqi Checkout.
     * Reutiliza el endpoint POST /charges, igual que los depósitos en garantía.
     * El id resultante (chr_...) se guarda como identificador del cobro de la suscripción.
     */
    public CulqiChargeResponse createSubscriptionCharge(
            PlanType plan,
            String token,
            String email,
            UUID companyUserId
    ) {
        var request = new CulqiChargeRequest(
                toCents(BigDecimal.valueOf(plan.monthlyPrice())),
                properties.currencyCode(),
                email,
                token,
                true,
                "Suscripción " + plan.name() + " - Achanvear",
                Map.of(
                        "type", "subscription",
                        "plan", plan.name(),
                        "companyUserId", companyUserId.toString(),
                        "provider", "culqi"
                )
        );

        return restClient.post()
                .uri("/charges")
                .body(request)
                .retrieve()
                .body(CulqiChargeResponse.class);
    }

    public CulqiChargeResponse createCreditPackageCharge(
            BigDecimal amount,
            String packageId,
            String packageName,
            String token,
            String email,
            UUID companyUserId
    ) {
        var request = new CulqiChargeRequest(
                toCents(amount),
                properties.currencyCode(),
                email,
                token,
                true,
                "Paquete de publicaciones " + packageName + " - Achanvear",
                Map.of(
                        "type", "credit_package",
                        "packageId", packageId,
                        "companyUserId", companyUserId.toString(),
                        "provider", "culqi"
                )
        );

        return restClient.post()
                .uri("/charges")
                .body(request)
                .retrieve()
                .body(CulqiChargeResponse.class);
    }

    public CulqiChargeResponse getCharge(String chargeId) {
        return restClient.get()
                .uri("/charges/{id}", chargeId)
                .retrieve()
                .body(CulqiChargeResponse.class);
    }

    public void refundCharge(String chargeId, BigDecimal amount, String reason) {
        var request = new CulqiRefundRequest(
                chargeId,
                toCents(amount),
                reason,
                Map.of("provider", "culqi")
        );

        restClient.post()
                .uri("/refunds")
                .body(request)
                .retrieve()
                .toBodilessEntity();
    }

    private int toCents(BigDecimal amount) {
        return amount.multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .intValueExact();
    }

    private String normalizeRequiredText(String value, String fallback, int minLength, int maxLength) {
        String normalized = value == null ? "" : value.trim();
        if (normalized.length() < minLength) {
            normalized = fallback;
        }
        if (normalized.length() > maxLength) {
            normalized = normalized.substring(0, maxLength);
        }
        return normalized;
    }

    private String normalizeOptionalText(String value, int minLength, int maxLength) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String normalized = value.trim();
        if (normalized.length() < minLength) {
            return null;
        }
        if (normalized.length() > maxLength) {
            normalized = normalized.substring(0, maxLength);
        }
        return normalized;
    }
}
