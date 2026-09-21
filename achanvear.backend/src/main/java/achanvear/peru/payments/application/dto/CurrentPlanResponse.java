package achanvear.peru.payments.application.dto;

public record CurrentPlanResponse(
        String planType,
        String status,
        String startDate,
        String endDate,
        Integer projectsUsed,
        Integer projectsLimit,
        Boolean isActive
) {
}
