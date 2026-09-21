package achanvear.peru.jobs.web.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ApplyJobRequest(
        String cvUrl,
        @NotBlank @Size(min = 10, max = 2000) String coverLetter
) {
}