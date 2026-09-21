package achanvear.peru.jobs.web.request;

import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for advancing or rejecting a candidate in the pipeline.
 */
public record AdvanceCandidateRequest(
        @NotBlank String action, // "ADVANCE" or "REJECT"
        String reason
) {
}
