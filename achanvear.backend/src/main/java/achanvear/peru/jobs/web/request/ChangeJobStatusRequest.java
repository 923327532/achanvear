package achanvear.peru.jobs.web.request;

import jakarta.validation.constraints.NotBlank;

public record ChangeJobStatusRequest(
        @NotBlank String status
) {
}