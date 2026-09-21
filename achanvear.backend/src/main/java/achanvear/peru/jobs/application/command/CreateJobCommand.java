package achanvear.peru.jobs.application.command;

import java.math.BigDecimal;
import java.time.Instant;

public record CreateJobCommand(
        String companyId,
        String title,
        String description,
        String location,
        String type,
        BigDecimal salaryMin,
        BigDecimal salaryMax,
        String currency,
        Integer vacancies,
        String requirements,
        String selectionMode,
        Boolean hideSalary,
        Integer maxCandidatesForScreening,
        Integer candidatesForTheoryInterview,
        Integer minimumScore,
        // Cierre de vacantes
        String closingMode,
        Instant closingDate,
        Integer maxApplicants,
        // Cuando notificar al candidato
        String notificationTiming
) {
}
