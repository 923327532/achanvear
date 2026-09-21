package achanvear.peru.compliance.application.dto;

import achanvear.peru.compliance.domain.model.LegalDocumentVersion;

import java.time.Instant;

public record LegalDocumentVersionResponse(
        String id,
        String documentType,
        String version,
        String title,
        String content,
        String status,
        Instant publishedAt,
        String publishedBy,
        Instant createdAt
) {

    public static LegalDocumentVersionResponse from(LegalDocumentVersion version, String documentType) {
        return new LegalDocumentVersionResponse(
                version.getId().toString(),
                documentType,
                version.getVersion(),
                version.getTitle(),
                version.getContent(),
                version.getStatus().name(),
                version.getPublishedAt(),
                version.getPublishedBy(),
                version.getCreatedAt()
        );
    }
}
