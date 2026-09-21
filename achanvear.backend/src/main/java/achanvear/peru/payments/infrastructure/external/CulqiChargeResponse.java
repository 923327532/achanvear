package achanvear.peru.payments.infrastructure.external;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

public record CulqiChargeResponse(
        String id,
        String object,
        BigDecimal amount,
        @JsonProperty("amount_refunded") BigDecimal amountRefunded,
        @JsonProperty("currency_code") String currencyCode,
        String email,
        Boolean outcome,
        @JsonProperty("source_id") String sourceId
) {
    public boolean isApproved() {
        return id != null && id.startsWith("chr_");
    }
}
