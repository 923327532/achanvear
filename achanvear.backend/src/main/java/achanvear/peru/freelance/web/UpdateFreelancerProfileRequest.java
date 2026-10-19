package achanvear.peru.freelance.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public record UpdateFreelancerProfileRequest(
        @Size(min = 3, max = 150)
        String name,

        @Size(min = 3, max = 120)
        String industry,

        @Size(min = 3, max = 120)
        String specialty,

        String profilePhotoUrl,

        String bannerUrl,

        @Size(min = 20, max = 2000)
        String biography,

        @Size(max = 2000)
        String achievements,

        String address,

        String paymentMethodType,

        @Pattern(regexp = "\\d{8}")
        String dni,

        String curriculumUrl,

        String cvData,

        @jakarta.validation.Valid
        List<CertificationRequest> certifications,

        @jakarta.validation.Valid
        List<SkillRequest> skills,

        @jakarta.validation.Valid
        List<PortfolioItemRequest> portfolioItems,

        // ── Preferencias de Configuración ──
        String availabilityStatus,

        String cvVisibility,

        String preferredCurrency,

        String preferredPaymentMethod,

        String language,

        String timezone,

        String notificationPreferences

) {
    public record CertificationRequest(
            @NotBlank
            @Size(min = 3, max = 150)
            String name,

            @NotBlank
            @Size(min = 2, max = 150)
            String issuingOrganization,

            String credentialUrl
    ) {
    }

    public record SkillRequest(
            @NotBlank
            @Size(min = 1, max = 100)
            String name,

            @NotBlank
            String level,

            Integer yearsOfExperience
    ) {
    }

    public record PortfolioItemRequest(
            @NotBlank
            @Size(min = 1, max = 200)
            String title,

            @Size(max = 2000)
            String description,

            String assetUrl,

            String projectUrl
    ) {
    }
}
