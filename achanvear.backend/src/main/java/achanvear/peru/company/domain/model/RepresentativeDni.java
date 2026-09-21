package achanvear.peru.company.domain.model;

import achanvear.peru.shared.domain.ValueObject;

import java.util.Objects;

public record RepresentativeDni(String value) implements ValueObject {

    public RepresentativeDni {
        Objects.requireNonNull(value, "Representative dni cannot be null");

        String normalizedValue = value.trim();
        if (!normalizedValue.matches("\\d{8}")) {
            throw new IllegalArgumentException("Representative dni must contain exactly 8 digits");
        }

        value = normalizedValue;
    }
}