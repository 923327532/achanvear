package achanvear.peru.identity.domain.model;

import achanvear.peru.shared.domain.ValueObject;

import java.util.Objects;
import java.util.regex.Pattern;

public record Email(String value) implements ValueObject {

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    public Email {
        Objects.requireNonNull(value, "Email cannot be null");

        String normalizedValue = value.trim().toLowerCase();
        if (normalizedValue.isBlank()) {
            throw new IllegalArgumentException("Email cannot be blank");
        }

        if (!EMAIL_PATTERN.matcher(normalizedValue).matches()) {
            throw new IllegalArgumentException("Invalid email format");
        }

        value = normalizedValue;
    }
}