package achanvear.peru.jobs.domain.factory;

import achanvear.peru.jobs.domain.model.JobPost;
import achanvear.peru.jobs.domain.model.JobPostId;
import achanvear.peru.jobs.domain.model.JobType;
import achanvear.peru.jobs.domain.model.SelectionMode;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Component
public class JobPostFactory {

    public JobPost create(
            UUID companyId,
            String title,
            String description,
            String location,
            JobType type,
            BigDecimal salaryMin,
            BigDecimal salaryMax,
            String currency,
            Integer vacancies,
            String requirements,
            String closingMode,
            Instant closingDate,
            Integer maxApplicants
    ) {
        JobPost jobPost = JobPost.create(
                JobPostId.generate(),
                companyId,
                title,
                description,
                location,
                type,
                salaryMin,
                salaryMax,
                currency,
                vacancies,
                requirements
        );

        // Configurar modo de seleccion
        // El frontend envia "MANUAL" o "AUTOMATIC", lo mapeamos a SelectionMode
        String modeStr = closingMode;
        // Si closingMode no viene, intentar con selectionMode (enviado por frontend)
        if (modeStr == null || modeStr.isBlank()) {
            // Por defecto CONTINUOUS si no se especifica
            jobPost.configureSelection(maxApplicants, closingDate, null, null, SelectionMode.CONTINUOUS);
            return jobPost;
        }

        try {
            String upper = modeStr.trim().toUpperCase();
            // Mapear valores del frontend a SelectionMode
            SelectionMode mode = switch (upper) {
                case "MANUAL", "SEMI_AUTOMATED" -> SelectionMode.CONTINUOUS;
                case "FULLY_AUTOMATED", "AUTOMATIC", "AUTO" -> SelectionMode.MAX_APPLICANTS;
                default -> {
                    try {
                        yield SelectionMode.valueOf(upper);
                    } catch (IllegalArgumentException e) {
                        yield SelectionMode.CONTINUOUS;
                    }
                }
            };
            jobPost.configureSelection(maxApplicants, closingDate, null, null, mode);
        } catch (Exception e) {
            // Por defecto CONTINUOUS
        }

        return jobPost;
    }
}
