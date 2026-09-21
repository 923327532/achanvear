package achanvear.peru.jobs.application.query;

public record JobSearchQuery(
        String search,
        String location,
        String type,
        String status,
        String companyId,
        int page,
        int size,
        String sortBy,
        String sortDirection
) {
}