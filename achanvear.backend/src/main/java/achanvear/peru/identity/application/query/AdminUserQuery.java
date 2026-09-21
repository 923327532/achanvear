package achanvear.peru.identity.application.query;

public record AdminUserQuery(
        String search,
        String role,
        String status,
        int page,
        int size
) {
}
