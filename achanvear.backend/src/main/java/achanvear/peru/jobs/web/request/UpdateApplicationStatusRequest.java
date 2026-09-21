package achanvear.peru.jobs.web.request;

import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for updating job application status.
 * Used by companies to manage candidate pipeline.
 */
public record UpdateApplicationStatusRequest(
        @NotBlank String jobPostId,
        @NotBlank String newStatus
) {
}
