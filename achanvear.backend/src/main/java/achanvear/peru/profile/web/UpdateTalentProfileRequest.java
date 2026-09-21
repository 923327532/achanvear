package achanvear.peru.profile.web;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record UpdateTalentProfileRequest(
        @NotBlank String profileType,
        @NotBlank @Size(min = 5, max = 180) String headline,
        @NotBlank @Size(min = 20, max = 2000) String biography,
        @NotBlank @Size(min = 2, max = 120) String location,
        String profilePhotoUrl,
        String curriculumUrl,
        @Valid List<SkillRequest> skills,
        @Valid List<PortfolioItemRequest> portfolioItems
) {
}
