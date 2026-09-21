package achanvear.peru.compliance.application.command;

public record PublishLegalDocumentVersionCommand(
        String type,
        String versionId,
        String publishedBy
) {
}
