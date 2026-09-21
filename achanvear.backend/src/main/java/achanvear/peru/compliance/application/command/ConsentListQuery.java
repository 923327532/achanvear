package achanvear.peru.compliance.application.command;

public record ConsentListQuery(
        String type,
        String userId,
        String status,
        int page,
        int size
) {
}
