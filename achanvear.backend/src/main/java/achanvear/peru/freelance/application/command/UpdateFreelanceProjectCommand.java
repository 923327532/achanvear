package achanvear.peru.freelance.application.command;

import java.math.BigDecimal;
import java.util.List;

public record UpdateFreelanceProjectCommand(
        String projectId,
        String requesterUserId,
        String title,
        String description,
        String category,
        String subcategory,
        BigDecimal budget,
        Integer estimatedDays,
        String experienceLevel,
        List<String> skills,
        String budgetType,
        String modality,
        String providerType,
        List<String> attachments,
        String currency,
        String language,
        BigDecimal minBudget,
        BigDecimal maxBudget,
        BigDecimal hourlyRateMin,
        BigDecimal hourlyRateMax
) {
}
