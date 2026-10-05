package achanvear.peru.jobs.application.dto;

public record CompanyHiringStatsResponse(
        long activeJobs,
        long totalApplications,
        long interviewsInProgress,
        long finalists
) {
}
