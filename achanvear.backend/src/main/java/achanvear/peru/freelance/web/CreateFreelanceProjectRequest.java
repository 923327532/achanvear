package achanvear.peru.freelance.web;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

public record CreateFreelanceProjectRequest(
        @NotBlank
        @Size(min = 5, max = 150)
        String title,

        @NotBlank
        @Size(min = 20, max = 5000)
        String description,

        @NotBlank
        @Size(min = 3, max = 120)
        String category,

        String subcategory,

        BigDecimal budget,

        @NotNull
        Integer estimatedDays,

        String experienceLevel,

        List<String> skills,

        String budgetType,

        String modality,

        String providerType,

        List<String> attachments,

        // ── Nuevos campos ──
        String currency,

        String language,

        BigDecimal minBudget,

        BigDecimal maxBudget,

        BigDecimal hourlyRateMin,

        BigDecimal hourlyRateMax
) {
}
