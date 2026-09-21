package achanvear.peru.company.domain.model;

import achanvear.peru.shared.domain.ValueObject;

import java.util.Objects;

public record Ruc(String value) implements ValueObject {

    public Ruc {
        Objects.requireNonNull(value, "Ruc cannot be null");

        String normalizedValue = value.trim();
        if (!normalizedValue.matches("\\d{11}")) {
            throw new IllegalArgumentException("Ruc must contain exactly 11 digits");
        }

        value = normalizedValue;
    }
}