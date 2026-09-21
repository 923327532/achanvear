package achanvear.peru.profile;

import java.util.Objects;

public class Skill {

    private final String name;
    private final SkillLevel level;
    private final Integer yearsOfExperience;

    private Skill(
            String name,
            SkillLevel level,
            Integer yearsOfExperience
    ) {
        this.name = validateRequiredText(name, "Skill name", 2, 100);
        this.level = Objects.requireNonNull(level, "Skill level cannot be null");
        this.yearsOfExperience = validateNonNegative(yearsOfExperience, "Years of experience");
    }

    public static Skill create(
            String name,
            SkillLevel level,
            Integer yearsOfExperience
    ) {
        return new Skill(name, level, yearsOfExperience);
    }

    public String getName() {
        return name;
    }

    public SkillLevel getLevel() {
        return level;
    }

    public Integer getYearsOfExperience() {
        return yearsOfExperience;
    }

    private static String validateRequiredText(String value, String fieldName, int min, int max) {
        Objects.requireNonNull(value, fieldName + " cannot be null");

        String normalizedValue = value.trim();
        if (normalizedValue.isBlank()) {
            throw new IllegalArgumentException(fieldName + " cannot be blank");
        }

        if (normalizedValue.length() < min || normalizedValue.length() > max) {
            throw new IllegalArgumentException(fieldName + " length must be between " + min + " and " + max + " characters");
        }

        return normalizedValue;
    }

    private static Integer validateNonNegative(Integer value, String fieldName) {
        Objects.requireNonNull(value, fieldName + " cannot be null");

        if (value < 0) {
            throw new IllegalArgumentException(fieldName + " cannot be negative");
        }

        return value;
    }
}