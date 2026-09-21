package achanvear.peru.payments.infrastructure.external;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;

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
}
