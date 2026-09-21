package achanvear.peru.hiring.web.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record EvaluateTheoryResultRequest(
        @NotBlank String hiringProcessId,
        @Min(0) @Max(100) int theoryScore
) {
}