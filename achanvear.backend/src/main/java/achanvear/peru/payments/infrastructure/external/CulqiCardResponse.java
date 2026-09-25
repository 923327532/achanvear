package achanvear.peru.payments.infrastructure.external;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Respuesta de Culqi al registrar una tarjeta.
 * Devuelve {@code card_} como id.
 */
public record CulqiCardResponse(
        String id,
        String object,
        @JsonProperty("customer_id") String customerId,
        @JsonProperty("source_id") String sourceId,
        @JsonProperty("last_four") String lastFour,
        String brand,
        @JsonProperty("exp_month") Integer expMonth,
        @JsonProperty("exp_year") Integer expYear,
        Boolean active
) {
    /** Expone la expiración como MM/AA (ej. "09/29"). */
    public String expirationDate() {
        if (expMonth == null || expYear == null) {
            return null;
        }
        return String.format("%02d/%02d", expMonth, expYear % 100);
    }
}
