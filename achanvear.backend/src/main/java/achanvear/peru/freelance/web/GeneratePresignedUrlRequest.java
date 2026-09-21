package achanvear.peru.freelance.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record GeneratePresignedUrlRequest(
        @NotBlank
        String fileName,

        @NotBlank
        String contentType,

        @NotBlank
        @Pattern(regexp = "PROFILE_PHOTO|CURRICULUM")
        String folder
) {
}