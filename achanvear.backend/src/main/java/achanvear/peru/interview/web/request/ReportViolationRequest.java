package achanvear.peru.interview.web.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ReportViolationRequest(
        @NotBlank String type,
        @NotNull @Min(1) Integer count,
        @NotBlank String timestamp
) {
}
