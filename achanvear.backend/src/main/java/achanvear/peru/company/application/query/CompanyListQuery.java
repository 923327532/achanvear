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
        String sortDirection,
        boolean includePrivate
) {
    public CompanyListQuery(String search, String status, String industry, String companySize, String companyPlan, int page, int size, String sortBy, String sortDirection) {
        this(search,status,industry,companySize,companyPlan,page,size,sortBy,sortDirection,false);
    }
}
