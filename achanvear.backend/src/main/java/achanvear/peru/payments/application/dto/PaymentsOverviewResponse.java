package achanvear.peru.payments.application.dto;

import java.math.BigDecimal;

public record PaymentsOverviewResponse(
        // Para empresas
        Integer publishedProjectsCount,
        Integer remainingFreeProjects,
        Boolean canPublishMoreProjects,
        String currentPlan,
        String planExpirationDate,

        // Para freelancers
        BigDecimal totalEarned,
        BigDecimal pendingRelease,
        BigDecimal availableForWithdrawal,
        BigDecimal totalCommissionsPaid,

        // Mensajes
        String upgradeMessage
) {
}
