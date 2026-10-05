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
            String selectionMode,
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

        // Configurar modo de cierre de la vacante.
        //
        // IMPORTANTE: el modo de cierre (MAX_APPLICANTS/FIXED_DATE/CONTINUOUS) es
        // INDEPENDIENTE del nivel de automatizacion (MANUAL/SEMI_AUTOMATED/FULLY_AUTOMATED).
        // El nivel de automatizacion se persiste por separado en
        // RecruitmentAutomationConfig; aqui solo se resuelve el cierre a partir de
        // `closingMode`. Si no viene, se infiere de los datos disponibles.
        SelectionMode mode = resolveClosingMode(closingMode, closingDate, maxApplicants);
        jobPost.configureSelection(maxApplicants, closingDate, null, null, mode);

        return jobPost;
    }

    /**
     * Aplica la configuracion de cierre a una vacante existente.
     * Reutiliza la misma resolucion de {@link SelectionMode} que el alta.
     */
    public void applySelection(
            JobPost jobPost,
            String closingMode,
            Instant closingDate,
            Integer maxApplicants
    ) {
        SelectionMode mode = resolveClosingMode(closingMode, closingDate, maxApplicants);
        jobPost.configureSelection(maxApplicants, closingDate, null, null, mode);
    }

    /**
     * Determina el {@link SelectionMode} (modo de cierre) a partir de {@code closingMode}.
     * Si no se especifica uno valido, se infiere de los datos de cierre presentes.
     */
    private SelectionMode resolveClosingMode(String closingMode, Instant closingDate, Integer maxApplicants) {
        if (closingMode != null && !closingMode.isBlank()) {
            String upper = closingMode.trim().toUpperCase();
            try {
                return SelectionMode.valueOf(upper);
            } catch (IllegalArgumentException e) {
                // Valor desconocido: se infiere de los datos disponibles
            }
        }

        if (maxApplicants != null && maxApplicants > 0) {
            return SelectionMode.MAX_APPLICANTS;
        }
        if (closingDate != null) {
            return SelectionMode.FIXED_DATE;
        }
        return SelectionMode.CONTINUOUS;
    }
}
