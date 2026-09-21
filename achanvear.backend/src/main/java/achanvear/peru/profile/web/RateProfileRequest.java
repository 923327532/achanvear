package achanvear.peru.profile.web;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RateProfileRequest(
        @NotBlank String reviewerType,
        @Min(1) @Max(5) int stars,
        boolean recommended,
        @Size(max = 1000) String comment
) {
}
