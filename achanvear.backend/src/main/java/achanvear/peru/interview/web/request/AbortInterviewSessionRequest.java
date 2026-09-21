package achanvear.peru.interview.web.request;

import jakarta.validation.constraints.NotBlank;

public record AbortInterviewSessionRequest(
        @NotBlank String reason
) {
}
