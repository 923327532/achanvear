package achanvear.peru.freelance.application.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record FreelanceProjectResponse(
        String id,
        String clientUserId,
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
        String status,
        String selectedFreelancerUserId,
        List<ProposalResponse> proposals,
        List<MilestoneResponse> milestones,
        Instant createdAt,
        String currency,
        String language,
        BigDecimal minBudget,
        BigDecimal maxBudget,
        BigDecimal hourlyRateMin,
        BigDecimal hourlyRateMax,
        // ── Datos de empresa ──
        String companyName,
        String companyInitials,
        String companyLogoUrl,
        double companyRating,
        int publishedJobsCount,
        int proposalCount,
        boolean hasApplied
) {
}


