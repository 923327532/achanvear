package achanvear.peru.jobs.application.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

public record JobPostResponse(
        String id,
        String companyId,
        CompanySummaryResponse company,
        String title,
        String description,
        String location,
        String type,
        BigDecimal salaryMin,
        BigDecimal salaryMax,
        String currency,
        Integer vacancies,
        String requirements,
        String status,
        List<ApplicationResponse> applications,
        LocalDateTime createdAt,
        // Campos de configuracion de seleccion
        String selectionMode,
        Integer maxApplicants,
        Instant closingDate,
        String closingMode
) {
}
