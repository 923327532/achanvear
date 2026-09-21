package achanvear.peru.freelance.domain.factory;

import achanvear.peru.freelance.domain.model.FreelanceProject;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Component
public class FreelanceProjectFactory {

    public FreelanceProject create(
            UUID clientUserId,
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
        return FreelanceProject.create(
                clientUserId,
                title,
                description,
                category,
                subcategory,
                budget,
                estimatedDays,
                experienceLevel,
                skills,
                budgetType,
                modality,
                providerType,
                attachments,
                currency,
                language,
                minBudget,
                maxBudget,
                hourlyRateMin,
                hourlyRateMax
        );
    }
}
