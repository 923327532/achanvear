package achanvear.peru.profile.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record GenerateProfilePresignedUrlRequest(
        @NotBlank String fileName,
        @NotBlank String contentType,
        @NotBlank
        @Pattern(regexp = "PROFILE_PHOTO|CURRICULUM|PORTFOLIO")
        String folder
) {
}
