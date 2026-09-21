package achanvear.peru.compliance.domain.model;

import java.time.Instant;
import java.util.Objects;

/**
 * Documento legal gestionado por la plataforma (Términos y Condiciones o Política de Privacidad).
 * Conserva la referencia a la versión vigente.
 */
public class LegalDocument {

    private final LegalDocumentId id;
    private final LegalDocumentType type;
    private String status;
    private String currentVersionId;

    public LegalDocument(LegalDocumentId id, LegalDocumentType type, String status, String currentVersionId) {
        this.id = Objects.requireNonNull(id, "Legal document id cannot be null");
        this.type = Objects.requireNonNull(type, "Legal document type cannot be null");
        this.status = status != null ? status : "ACTIVE";
        this.currentVersionId = currentVersionId;
    }

    public void setCurrentVersion(String versionId) {
        this.currentVersionId = Objects.requireNonNull(versionId, "Version id cannot be null");
    }

    public void deactivate() {
        this.status = "INACTIVE";
    }

    public LegalDocumentId getId() {
        return id;
    }

    public LegalDocumentType getType() {
        return type;
    }

    public String getStatus() {
        return status;
    }

    public String getCurrentVersionId() {
        return currentVersionId;
    }
}
