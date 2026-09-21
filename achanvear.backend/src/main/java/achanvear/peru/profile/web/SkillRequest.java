package achanvear.peru.profile.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SkillRequest(
        @NotBlank String name,
        @NotBlank String level,
        @NotNull Integer yearsOfExperience
) {
}
