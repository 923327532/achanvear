package achanvear.peru.admin.application.dto;

public record AdminMetricsResponse(
        long totalUsers,
        long totalCompanies,
        long totalFreelancers,
        long totalApplications,
        long interviewsStarted,
        long interviewsCompleted,
        long interviewsApproved,
        long interviewsRejected,
        long antiCheatIncidents,
        long aiSystemUsage
) {
}
