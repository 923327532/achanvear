package achanvear.peru.profile.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PortfolioItemRequest(
        @NotBlank @Size(min = 3, max = 150) String title,
        @NotBlank @Size(min = 10, max = 1000) String description,
        String assetUrl,
        String projectUrl
) {
}
