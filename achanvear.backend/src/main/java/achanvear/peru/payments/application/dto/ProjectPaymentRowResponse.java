package achanvear.peru.payments.application.dto;

import java.math.BigDecimal;

public record ProjectPaymentRowResponse(
        String projectId,
        String projectTitle,
        String milestoneId,
        String milestoneTitle,
        BigDecimal grossAmount,
        BigDecimal platformCommission,
        BigDecimal mpCommission,
        BigDecimal netAmount,
        String status,
        String date
) {
}
