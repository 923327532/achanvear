package achanvear.peru.payments.application.dto;

import java.math.BigDecimal;
import java.util.List;

public record FreelancerWalletSummaryResponse(
        BigDecimal totalEarned,
        BigDecimal pendingRelease,
        BigDecimal availableForWithdrawal,
        BigDecimal totalPlatformCommissions,
        BigDecimal totalMpCommissions,
        BigDecimal netEarnings,
        List<ProjectPaymentRowResponse> recentPayments,
        String currency
) {
}
