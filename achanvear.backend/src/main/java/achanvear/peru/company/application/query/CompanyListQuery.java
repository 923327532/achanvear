package achanvear.peru.company.application.query;

public record CompanyListQuery(
        String search,
        String status,
        String industry,
        String companySize,
        String companyPlan,
        int page,
        int size,
        String sortBy,
        String sortDirection
) {
}