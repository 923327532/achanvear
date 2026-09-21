package achanvear.peru.compliance.application.dto;

public record LegalDocumentResponse(
        String type,
        String currentVersionId,
        String status,
        LegalDocumentVersionResponse currentVersion
) {
}
