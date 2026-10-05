package achanvear.peru.payments.infrastructure.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

@JsonIgnoreProperties(ignoreUnknown = true)
public record CulqiChargeResponse(
        String id,
        String object,
        BigDecimal amount,
        @JsonProperty("amount_refunded") BigDecimal amountRefunded,
        @JsonProperty("currency_code") String currencyCode,
        String email,
        Outcome outcome,
        @JsonProperty("source_id") String sourceId
) {
    public boolean isApproved() {
        return id != null && id.startsWith("chr_");
    }

    /**
     * Culqi devuelve "outcome" como objeto (no booleano), por ejemplo:
     * {"type":"venta_exitosa","code":"venta_exitosa","merchant_message":"..."}.
     * Se modela como objeto para que la deserialización del /charges no falle.
     */
    public record Outcome(
            String type,
            String code,
            @JsonProperty("merchant_message") String merchantMessage
    ) {
    }
}
