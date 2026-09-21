package achanvear.peru.profile;

import java.util.Objects;

public class PortfolioItem {

    private final String title;
    private final String description;
    private final String assetUrl;
    private final String projectUrl;

    private PortfolioItem(
            String title,
            String description,
            String assetUrl,
            String projectUrl
    ) {
        this.title = validateRequiredText(title, "Portfolio title", 3, 150);
        this.description = validateRequiredText(description, "Portfolio description", 10, 1000);
        this.assetUrl = normalizeOptionalText(assetUrl);
        this.projectUrl = normalizeOptionalText(projectUrl);
    }

    public static PortfolioItem create(
            String title,
            String description,
            String assetUrl,
            String projectUrl
    ) {
        return new PortfolioItem(title, description, assetUrl, projectUrl);
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getAssetUrl() {
        return assetUrl;
    }

    public String getProjectUrl() {
        return projectUrl;
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

    private static String normalizeOptionalText(String value) {
        if (value == null) {
            return null;
        }

        String normalizedValue = value.trim();
        return normalizedValue.isBlank() ? null : normalizedValue;
    }
}