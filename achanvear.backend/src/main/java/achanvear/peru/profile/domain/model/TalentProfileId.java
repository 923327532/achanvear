package achanvear.peru.profile.domain.model;

import achanvear.peru.shared.domain.ValueObject;

import java.util.Objects;
import java.util.UUID;

public record TalentProfileId(UUID value) implements ValueObject {

    public TalentProfileId {
        Objects.requireNonNull(value, "Talent profile id cannot be null");
    }

    public static TalentProfileId generate() {
        return new TalentProfileId(UUID.randomUUID());
    }

    public static TalentProfileId from(String value) {
        return new TalentProfileId(UUID.fromString(value));
    }

    @Override
    public String toString() {
        return value.toString();
    }
}