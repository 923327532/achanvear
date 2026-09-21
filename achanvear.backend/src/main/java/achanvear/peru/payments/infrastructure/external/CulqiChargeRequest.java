package achanvear.peru.payments.infrastructure.external;

import java.util.Map;

public record CulqiChargeRequest(
        int amount,
        String currency_code,
        String email,
        String source_id,
        Boolean capture,
        String description,
        Map<String, String> metadata
) {
}
