package achanvear.peru.payments.infrastructure.external;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Request para registrar un cliente en Culqi.
 * POST /v2/customers
 */
public record CulqiCustomerRequest(
        @JsonProperty("first_name") String firstName,
        @JsonProperty("last_name") String lastName,
        String email,
        String address,
        @JsonProperty("phone_number") String phoneNumber
) {
}
