package achanvear.peru.freelance.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateFreelancerProfileRequest(
        @NotBlank
        @Size(min = 3, max = 150)
        String name,

        @NotBlank
        @Size(min = 3, max = 120)
        String industry,

        @NotBlank
        @Size(min = 3, max = 120)
        String specialty,

        String profilePhotoUrl,

        @NotBlank
        @Size(min = 20, max = 2000)
        String biography,

        @Size(max = 2000)
        String achievements,

        @Size(max = 255)
        String address,

        String paymentMethodType,

        @NotBlank
        @Pattern(regexp = "\\d{8}")
        String dni,

        String curriculumUrl,

        List<CertificationRequest> certifications,

        List<SkillRequest> skills,

        List<PortfolioItemRequest> portfolioItems
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
