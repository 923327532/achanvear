package achanvear.peru.payments.infrastructure.external;

import java.util.Map;

public record CulqiRefundRequest(
        String charge_id,
        Integer amount,
        String reason,
        Map<String, String> metadata
) {
}
