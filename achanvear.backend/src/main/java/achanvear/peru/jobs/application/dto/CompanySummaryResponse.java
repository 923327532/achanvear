package achanvear.peru.jobs.application.dto;

public record CompanySummaryResponse(
        String id,
        String businessName,
        String tradeName,
        String industry,
        String specialty,
        String companySize,
        String logoUrl,
        String status
) {
}