package achanvear.peru.compliance.domain.model;

import java.time.Instant;
import java.util.Objects;

/**
 * Versión de un documento legal. Las versiones que ya fueron aceptadas
 * no se eliminan físicamente: se conservan como históricas o inactivas.
 */
public class LegalDocumentVersion {

    private final LegalDocumentVersionId id;
    private final LegalDocumentId documentId;
    private final String version;
    private final String title;
    private final String content;
    private LegalDocumentVersionStatus status;
    private Instant publishedAt;
    private String publishedBy;
    private final Instant createdAt;

    public LegalDocumentVersion(
            LegalDocumentVersionId id,
            LegalDocumentId documentId,
            String version,
            String title,
            String content,
            LegalDocumentVersionStatus status,
            Instant publishedAt,
            String publishedBy,
            Instant createdAt
    ) {
        this.id = Objects.requireNonNull(id, "Version id cannot be null");
        this.documentId = Objects.requireNonNull(documentId, "Document id cannot be null");
        this.version = Objects.requireNonNull(version, "Version number cannot be null");
        this.title = Objects.requireNonNull(title, "Title cannot be null");
        this.content = Objects.requireNonNull(content, "Content cannot be null");
        this.status = status != null ? status : LegalDocumentVersionStatus.DRAFT;
        this.publishedAt = publishedAt;
        this.publishedBy = publishedBy;
        this.createdAt = createdAt != null ? createdAt : Instant.now();
    }

    public static LegalDocumentVersion create(
            LegalDocumentVersionId id,
            LegalDocumentId documentId,
            String version,
            String title,
            String content
    ) {
        return new LegalDocumentVersion(
                id,
                documentId,
                version,
                title,
                content,
                LegalDocumentVersionStatus.DRAFT,
                null,
                null,
                Instant.now()
        );
    }

    public void publish(String publishedBy) {
        if (this.status == LegalDocumentVersionStatus.PUBLISHED) {
            throw new IllegalStateException("Version is already published");
        }
        this.status = LegalDocumentVersionStatus.PUBLISHED;
        this.publishedBy = Objects.requireNonNull(publishedBy, "Publisher cannot be null");
        this.publishedAt = Instant.now();
    }

    public void archive() {
        if (this.status == LegalDocumentVersionStatus.PUBLISHED) {
            this.status = LegalDocumentVersionStatus.ARCHIVED;
        }
    }

    public LegalDocumentVersionId getId() {
        return id;
    }

    public LegalDocumentId getDocumentId() {
        return documentId;
    }

    public String getVersion() {
        return version;
    }

    public String getTitle() {
        return title;
    }

    public String getContent() {
        return content;
    }

    public LegalDocumentVersionStatus getStatus() {
        return status;
    }

    public Instant getPublishedAt() {
        return publishedAt;
    }

    public String getPublishedBy() {
        return publishedBy;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
