package achanvear.peru.freelance.application.query;

public record FreelanceProjectSearchQuery(
        String search,
        String category,
        String status,
        int page,
        int size,
        String sortBy,
        String sortDirection,
        String clientUserId
) {

    public FreelanceProjectSearchQuery(
            String search,
            String category,
            String status,
            int page,
            int size,
            String sortBy,
            String sortDirection
    ) {
        this(search, category, status, page, size, sortBy, sortDirection, null);
    }
}
