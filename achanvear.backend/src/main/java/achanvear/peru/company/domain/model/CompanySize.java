package achanvear.peru.company.domain.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.HashMap;
import java.util.Map;

public enum CompanySize {
    MICROENTERPRISE,
    SMALL_BUSINESS,
    MEDIUM_BUSINESS,
    LARGE_ENTERPRISE;

    private static final Map<String, CompanySize> ALIASES = new HashMap<>();

    static {
        // Aliases para MICROENTERPRISE
        ALIASES.put("MICROENTERPRISE", MICROENTERPRISE);
        ALIASES.put("MICRO", MICROENTERPRISE);
        ALIASES.put("micro", MICROENTERPRISE);
        ALIASES.put("MICROEMPRESA", MICROENTERPRISE);
        ALIASES.put("MYPE", MICROENTERPRISE);

        // Aliases para SMALL_BUSINESS
        ALIASES.put("SMALL_BUSINESS", SMALL_BUSINESS);
        ALIASES.put("SMALL", SMALL_BUSINESS);
        ALIASES.put("small", SMALL_BUSINESS);
        ALIASES.put("PEQUENA", SMALL_BUSINESS);
        ALIASES.put("PEQUEÑA", SMALL_BUSINESS);

        // Aliases para MEDIUM_BUSINESS
        ALIASES.put("MEDIUM_BUSINESS", MEDIUM_BUSINESS);
        ALIASES.put("MEDIUM", MEDIUM_BUSINESS);
        ALIASES.put("medium", MEDIUM_BUSINESS);
        ALIASES.put("MEDIANA", MEDIUM_BUSINESS);

        // Aliases para LARGE_ENTERPRISE
        ALIASES.put("LARGE_ENTERPRISE", LARGE_ENTERPRISE);
        ALIASES.put("LARGE", LARGE_ENTERPRISE);
        ALIASES.put("large", LARGE_ENTERPRISE);
        ALIASES.put("GRANDE", LARGE_ENTERPRISE);
        ALIASES.put("ENTERPRISE", LARGE_ENTERPRISE);
    }

    @JsonCreator
    public static CompanySize fromValue(String value) {
        if (value == null) {
            return null;
        }
        CompanySize result = ALIASES.get(value);
        if (result != null) {
            return result;
        }
        // Fallback: intentar match exacto por nombre
        try {
            return CompanySize.valueOf(value);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid CompanySize value: " + value + ". Accepted values: MICROENTERPRISE, SMALL_BUSINESS, MEDIUM_BUSINESS, LARGE_ENTERPRISE (or aliases: MICRO, SMALL, MEDIUM, LARGE, etc.)");
        }
    }

    @JsonValue
    public String toValue() {
        return name();
    }
}
