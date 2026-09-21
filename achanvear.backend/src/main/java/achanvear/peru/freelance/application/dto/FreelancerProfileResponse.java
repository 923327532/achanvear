package achanvear.peru.freelance.application.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record FreelancerProfileResponse(
        // ── Campos del módulo freelance ──
        String id,
        String userId,
        String name,
        String industry,
        String specialty,
        String profilePhotoUrl,
        String biography,
        String achievements,
        String address,
        String paymentMethodType,
        String dni,
        String curriculumUrl,
        String cvData,
        String status,
        List<FreelancerCertificationResponse> certifications,

        // ── Campos del módulo profile (TalentProfile) ──
        String headline,
        String location,
        ReputationScoreResponse reputationScore,
        List<SkillResponse> skills,
        List<PortfolioItemResponse> portfolioItems,
        List<ProfileRatingResponse> ratings,

        // ── Preferencias de Configuración (2.1 - 2.4) ──
        String availabilityStatus,
        String cvVisibility,
        String preferredCurrency,
        String preferredPaymentMethod,
        String language,
        String timezone,
        String notificationPreferences
) {


    // ─── DTOs anidados ──────────────────────────────────────────────────────────

    public record ReputationScoreResponse(
            BigDecimal averageStars,
            BigDecimal recommendationPercentage,
            int totalRatings
    ) {}

    public record SkillResponse(
            String name,
            String level,
            Integer yearsOfExperience
    ) {}

    public record PortfolioItemResponse(
            String title,
            String description,
            String assetUrl,
            String projectUrl
    ) {}

    public record ProfileRatingResponse(
            String reviewerUserId,
            String reviewerType,
            int stars,
            boolean recommended,
            String comment,
            Instant createdAt
    ) {}
}