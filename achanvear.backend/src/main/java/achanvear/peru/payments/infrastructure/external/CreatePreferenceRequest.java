package achanvear.peru.payments.infrastructure.external;

import java.math.BigDecimal;

public record CreatePreferenceRequest(
        BigDecimal transactionAmount,
        String externalReference,
        String milestoneId
) {
}