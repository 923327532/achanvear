package achanvear.peru.compliance.domain.model;

import java.util.Objects;
import java.util.UUID;

public record LegalDocumentVersionId(UUID value) {

    public LegalDocumentVersionId {
        Objects.requireNonNull(value, "Legal document version id cannot be null");
    }

    public static LegalDocumentVersionId generate() {
        return new LegalDocumentVersionId(UUID.randomUUID());
    }

    public static LegalDocumentVersionId from(String value) {
        return new LegalDocumentVersionId(UUID.fromString(value));
    }

    @Override
    public String toString() {
        return value.toString();
    }
}
