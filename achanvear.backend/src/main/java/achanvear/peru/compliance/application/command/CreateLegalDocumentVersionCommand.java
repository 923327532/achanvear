package achanvear.peru.compliance.application.command;

public record CreateLegalDocumentVersionCommand(
        String type,
        String version,
        String title,
        String content,
        String publishedBy
) {
}
