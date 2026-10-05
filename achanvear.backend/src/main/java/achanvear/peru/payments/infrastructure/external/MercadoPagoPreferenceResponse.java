package achanvear.peru.payments.infrastructure.external;

import com.fasterxml.jackson.annotation.JsonProperty;

public record MercadoPagoPreferenceResponse(
        String id,
        @JsonProperty("init_point")
        String initPoint,
        @JsonProperty("sandbox_init_point")
        String sandboxInitPoint
) {
}
