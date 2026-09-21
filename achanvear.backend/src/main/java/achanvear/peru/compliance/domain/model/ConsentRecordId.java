package achanvear.peru.compliance.domain.model;

import java.util.Objects;
import java.util.UUID;

public record ConsentRecordId(UUID value) {

    public ConsentRecordId {
        Objects.requireNonNull(value, "Consent record id cannot be null");
    }

    public static ConsentRecordId generate() {
        return new ConsentRecordId(UUID.randomUUID());
    }

    public static ConsentRecordId from(String value) {
        return new ConsentRecordId(UUID.fromString(value));
    }

    @Override
    public String toString() {
        return value.toString();
    }
}
