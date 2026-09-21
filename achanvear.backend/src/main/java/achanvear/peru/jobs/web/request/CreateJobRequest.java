package achanvear.peru.jobs.web.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.Map;

public record CreateJobRequest(
        @NotBlank @Size(min = 5, max = 150) String title,
        @NotBlank @Size(min = 20, max = 5000) String description,
        @NotBlank @Size(min = 2, max = 120) String location,
        @NotBlank String type,
        @NotNull @DecimalMin("0.00") BigDecimal salaryMin,
        @NotNull @DecimalMin("0.00") BigDecimal salaryMax,
        @NotBlank String currency,
        @NotNull @Min(1) Integer vacancies,
        @Size(max = 5000) String requirements,
        @NotBlank String selectionMode,
        Boolean hideSalary,
        Integer maxCandidatesForScreening,
        Integer candidatesForTheoryInterview,
        Integer minimumScore,
        // Cierre de vacantes
        String closingMode,
        String closingDate,
        Integer maxApplicants,
        // Cuando notificar al candidato
        String notificationTiming
) {
}
