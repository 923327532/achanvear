package achanvear.peru.profile.application.query;

public record ProfileSearchQuery(
        String search,
        String profileType,
        String skill,
        int page,
        int size,
        String sortBy,
        String sortDirection
) {
}