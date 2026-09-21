package achanvear.peru.compliance.domain.model;

import java.util.Objects;
import java.util.UUID;

public record LegalDocumentId(UUID value) {

    public LegalDocumentId {
        Objects.requireNonNull(value, "Legal document id cannot be null");
    }

    public static LegalDocumentId generate() {
        return new LegalDocumentId(UUID.randomUUID());
    }

    public static LegalDocumentId from(String value) {
        return new LegalDocumentId(UUID.fromString(value));
    }

    @Override
    public String toString() {
        return value.toString();
    }
}
