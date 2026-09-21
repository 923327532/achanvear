package achanvear.peru.payments.application.dto;

public record PlanOptionResponse(
        String planType,
        String displayName,
        Integer monthlyPrice,
        Integer yearlyPrice,
        Integer maxProjects,
        Integer maxInvitesPerProject,
        String[] benefits,
        Boolean isPopular,
        Boolean isActive,
        String description
) {
}