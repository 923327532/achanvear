package achanvear.peru.payments.infrastructure.external;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Request para registrar una tarjeta a partir de un token de Culqi Checkout.
 * POST /v2/cards
 */
public record CulqiCardRequest(
        @JsonProperty("customer_id") String customerId,
        @JsonProperty("token_id") String tokenId
) {
}
