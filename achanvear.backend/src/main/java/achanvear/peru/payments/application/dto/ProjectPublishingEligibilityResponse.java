package achanvear.peru.payments.application.dto;

public record ProjectPublishingEligibilityResponse(
        Boolean canPublish,
        Integer currentProjectCount,
        Integer maxAllowedProjects,
        Integer remainingFreeProjects,
        String message,
        Boolean requiresUpgrade
) {
}
