package achanvear.peru.payments.application.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record WalletSummaryResponse(
        BigDecimal totalEarned,
        BigDecimal totalCommissionsPaid,
        String activePlan,
        Instant subscriptionEndDate
) {
}