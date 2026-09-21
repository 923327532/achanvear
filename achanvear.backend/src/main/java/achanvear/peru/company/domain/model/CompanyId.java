package achanvear.peru.company.domain.model;

import achanvear.peru.shared.domain.ValueObject;

import java.util.Objects;
import java.util.UUID;

public record CompanyId(UUID value) implements ValueObject {

    public CompanyId {
        Objects.requireNonNull(value, "Company id cannot be null");
    }

    public static CompanyId generate() {
        return new CompanyId(UUID.randomUUID());
    }

    public static CompanyId from(String value) {
        return new CompanyId(UUID.fromString(value));
    }

    @Override
    public String toString() {
        return value.toString();
    }
}