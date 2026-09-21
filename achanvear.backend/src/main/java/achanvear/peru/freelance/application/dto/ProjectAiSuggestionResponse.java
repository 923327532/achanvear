package achanvear.peru.freelance.application.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ProjectAiSuggestionResponse(
        String title,
        String category,
        String subcategory,
        String description,
        String skills,
        String experienceLevel,
        String budgetType,
        Double budget,
        Double minBudget,
        Double maxBudget,
        Double hourlyRateMin,
        Double hourlyRateMax,
        String currency,
        String language,
        Integer estimatedDays,
        String modality,
        String providerType
) {}
