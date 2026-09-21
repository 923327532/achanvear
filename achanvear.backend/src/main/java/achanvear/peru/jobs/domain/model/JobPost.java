package achanvear.peru.jobs.domain.model;

import achanvear.peru.jobs.domain.event.ApplicationSubmittedEvent;
import achanvear.peru.jobs.domain.event.JobPublishedEvent;
import achanvear.peru.shared.domain.AggregateRoot;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

public class JobPost extends AggregateRoot<JobPostId> {

    private final JobPostId id;
    private final UUID companyId;
    private String title;
    private String description;
    private String location;
    private JobType type;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String currency;
    private Integer vacancies;
    private String requirements;
    private JobStatus status;
    private final List<JobApplication> applications;
    private Instant createdAt;

    // Nuevos campos para configuracion de seleccion
    private Integer maxApplicants;
    private Instant closingDate;
    private Double requiredScoreThreshold;
    private Integer selectedCandidatesCount;
    private SelectionMode selectionMode;

    private JobPost(
            JobPostId id,
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
            JobStatus status,
            List<JobApplication> applications,
            Instant createdAt,
            Integer maxApplicants,
            Instant closingDate,
            Double requiredScoreThreshold,
            Integer selectedCandidatesCount,
            SelectionMode selectionMode
    ) {
        this.id = Objects.requireNonNull(id, "Job post id cannot be null");
        this.companyId = Objects.requireNonNull(companyId, "Company id cannot be null");
        this.title = validateRequiredText(title, "Title", 5, 150);
        this.description = validateRequiredText(description, "Description", 20, 5000);
        this.location = validateRequiredText(location, "Location", 2, 120);
        this.type = Objects.requireNonNull(type, "Job type cannot be null");
        this.salaryMin = normalizeAmount(salaryMin, "Salary min");
        this.salaryMax = normalizeAmount(salaryMax, "Salary max");
        this.currency = validateRequiredText(currency, "Currency", 3, 10).toUpperCase();
        this.vacancies = validatePositive(vacancies, "Vacancies");
        this.requirements = requirements;
        this.status = Objects.requireNonNull(status, "Job status cannot be null");
        this.applications = new ArrayList<>(Objects.requireNonNull(applications, "Applications cannot be null"));
        this.createdAt = createdAt;
        this.maxApplicants = maxApplicants;
        this.closingDate = closingDate;
        this.requiredScoreThreshold = requiredScoreThreshold;
        this.selectedCandidatesCount = selectedCandidatesCount;
        this.selectionMode = selectionMode;

        validateSalaryRange(this.salaryMin, this.salaryMax);
    }

    public static JobPost create(
            JobPostId id,
            UUID companyId,
            String title,
            String description,
            String location,
            JobType type,
            BigDecimal salaryMin,
            BigDecimal salaryMax,
            String currency,
            Integer vacancies,
            String requirements
    ) {
        JobPost jobPost = new JobPost(
                id,
                companyId,
                title,
                description,
                location,
                type,
                salaryMin,
                salaryMax,
                currency,
                vacancies,
                requirements,
                JobStatus.PUBLISHED,
                new ArrayList<>(),
                Instant.now(),
                null,
                null,
                null,
                null,
                null
        );

        jobPost.registerEvent(JobPublishedEvent.now(jobPost.id, jobPost.title));

        return jobPost;
    }

    public static JobPost restore(
            JobPostId id,
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
            JobStatus status,
            List<JobApplication> applications,
            Instant createdAt,
            Integer maxApplicants,
            Instant closingDate,
            Double requiredScoreThreshold,
            Integer selectedCandidatesCount,
            SelectionMode selectionMode
    ) {
        return new JobPost(
                id,
                companyId,
                title,
                description,
                location,
                type,
                salaryMin,
                salaryMax,
                currency,
                vacancies,
                requirements,
                status,
                applications,
                createdAt,
                maxApplicants,
                closingDate,
                requiredScoreThreshold,
                selectedCandidatesCount,
                selectionMode
        );
    }

    public void apply(UUID candidateUserId, String cvUrl, String coverLetter) {
        ensurePublished();

        boolean alreadyApplied = this.applications.stream()
                .anyMatch(application -> application.getCandidateUserId().equals(candidateUserId));

        if (alreadyApplied) {
            throw new IllegalArgumentException("Candidate already applied to this job");
        }

        JobApplication application = JobApplication.create(this.id.value(), candidateUserId, cvUrl, coverLetter);
        this.applications.add(application);

        registerEvent(ApplicationSubmittedEvent.now(this.id, application.getId(), candidateUserId));
    }

    public void close() {
        if (this.status == JobStatus.CLOSED) {
            throw new IllegalStateException("Job post is already closed");
        }

        this.status = JobStatus.CLOSED;
    }

    public void cancel() {
        if (this.status == JobStatus.CLOSED) {
            throw new IllegalStateException("Job post is already cancelled");
        }

        this.status = JobStatus.CLOSED;
    }

    public void suspend() {
        if (this.status == JobStatus.SUSPENDED) {
            throw new IllegalStateException("Job post is already suspended");
        }

        this.status = JobStatus.SUSPENDED;
    }

    public void publish() {
        if (this.status == JobStatus.PUBLISHED) {
            throw new IllegalStateException("Job post is already published");
        }

        if (this.status == JobStatus.CLOSED) {
            throw new IllegalStateException("Cannot publish a closed job post");
        }

        this.status = JobStatus.PUBLISHED;

        registerEvent(JobPublishedEvent.now(this.id, this.title));
    }

    public void update(
            String title,
            String description,
            String location,
            JobType type,
            BigDecimal salaryMin,
            BigDecimal salaryMax,
            String currency,
            Integer vacancies
    ) {
        ensureEditable();

        this.title = validateRequiredText(title, "Title", 5, 150);
        this.description = validateRequiredText(description, "Description", 20, 5000);
        this.location = validateRequiredText(location, "Location", 2, 120);
        this.type = Objects.requireNonNull(type, "Job type cannot be null");
        this.salaryMin = normalizeAmount(salaryMin, "Salary min");
        this.salaryMax = normalizeAmount(salaryMax, "Salary max");
        this.currency = validateRequiredText(currency, "Currency", 3, 10).toUpperCase();
        this.vacancies = validatePositive(vacancies, "Vacancies");

        validateSalaryRange(this.salaryMin, this.salaryMax);
    }

    public boolean belongsTo(UUID companyId) {
        return this.companyId.equals(companyId);
    }

    public JobPostId getId() {
        return id;
    }

    public UUID getCompanyId() {
        return companyId;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getLocation() {
        return location;
    }

    public JobType getType() {
        return type;
    }

    public BigDecimal getSalaryMin() {
        return salaryMin;
    }

    public BigDecimal getSalaryMax() {
        return salaryMax;
    }

    public String getCurrency() {
        return currency;
    }

    public Integer getVacancies() {
        return vacancies;
    }

    public JobStatus getStatus() {
        return status;
    }

    public String getRequirements() {
        return requirements;
    }

    public List<JobApplication> getApplications() {
        return List.copyOf(applications);
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    private void ensurePublished() {
        if (this.status != JobStatus.PUBLISHED) {
            throw new IllegalStateException("Applications are allowed only for published job posts");
        }
    }

    private void ensureEditable() {
        if (this.status == JobStatus.CLOSED || this.status == JobStatus.SUSPENDED) {
            throw new IllegalStateException("Closed or suspended job posts cannot be updated");
        }
    }

    private static String validateRequiredText(String value, String fieldName, int min, int max) {
        Objects.requireNonNull(value, fieldName + " cannot be null");

        String normalizedValue = value.trim();
        if (normalizedValue.isBlank()) {
            throw new IllegalArgumentException(fieldName + " cannot be blank");
        }

        if (normalizedValue.length() < min || normalizedValue.length() > max) {
            throw new IllegalArgumentException(fieldName + " length must be between " + min + " and " + max + " characters");
        }

        return normalizedValue;
    }

    private static Integer validatePositive(Integer value, String fieldName) {
        Objects.requireNonNull(value, fieldName + " cannot be null");

        if (value <= 0) {
            throw new IllegalArgumentException(fieldName + " must be greater than zero");
        }

        return value;
    }

    private static BigDecimal normalizeAmount(BigDecimal value, String fieldName) {
        Objects.requireNonNull(value, fieldName + " cannot be null");

        if (value.signum() < 0) {
            throw new IllegalArgumentException(fieldName + " cannot be negative");
        }

        return value;
    }

    private static void validateSalaryRange(BigDecimal salaryMin, BigDecimal salaryMax) {
        if (salaryMin.compareTo(salaryMax) > 0) {
            throw new IllegalArgumentException("Salary min cannot be greater than salary max");
        }
    }

    // ========== Metodos de configuracion de seleccion ==========

    /**
     * Configura el modo de seleccion de candidatos.
     * @param maxApplicants cupo maximo de postulantes (para modo MAX_APPLICANTS)
     * @param closingDate fecha de cierre (para modo FIXED_DATE)
     * @param requiredScoreThreshold puntaje minimo para pasar screening
     * @param selectedCandidatesCount cantidad de candidatos a seleccionar al final
     * @param selectionMode modo de seleccion
     */
    public void configureSelection(
            Integer maxApplicants,
            Instant closingDate,
            Double requiredScoreThreshold,
            Integer selectedCandidatesCount,
            SelectionMode selectionMode
    ) {
        this.selectionMode = Objects.requireNonNull(selectionMode, "Selection mode cannot be null");

        switch (selectionMode) {
            case MAX_APPLICANTS -> {
                if (maxApplicants == null || maxApplicants <= 0) {
                    throw new IllegalArgumentException("maxApplicants must be > 0 for MAX_APPLICANTS mode");
                }
                this.maxApplicants = maxApplicants;
                this.closingDate = null;
            }
            case FIXED_DATE -> {
                if (closingDate == null) {
                    throw new IllegalArgumentException("closingDate is required for FIXED_DATE mode");
                }
                if (closingDate.isBefore(Instant.now())) {
                    throw new IllegalArgumentException("closingDate must be in the future");
                }
                this.closingDate = closingDate;
                this.maxApplicants = null;
            }
            case CONTINUOUS -> {
                this.maxApplicants = maxApplicants;
                this.closingDate = closingDate;
            }
        }

        this.requiredScoreThreshold = requiredScoreThreshold != null ? requiredScoreThreshold : 60.0;
        this.selectedCandidatesCount = selectedCandidatesCount != null ? selectedCandidatesCount : 1;
    }

    /**
     * Verifica si la vacante ha alcanzado su cupo maximo de postulantes.
     */
    public boolean hasReachedMaxApplicants() {
        if (selectionMode != SelectionMode.MAX_APPLICANTS || maxApplicants == null) {
            return false;
        }
        long approvedCount = applications.stream()
                .filter(a -> a.getScreeningResult() != null && a.getScreeningResult())
                .count();
        return approvedCount >= maxApplicants;
    }

    /**
     * Verifica si la fecha de cierre ha pasado.
     */
    public boolean hasClosingDatePassed() {
        if (closingDate == null) {
            return false;
        }
        return Instant.now().isAfter(closingDate);
    }

    /**
     * Obtiene los candidatos aprobados en screening, ordenados por score descendente.
     */
    public List<JobApplication> getTopScoredApplications() {
        return applications.stream()
                .filter(a -> a.getScreeningResult() != null && a.getScreeningResult())
                .sorted(Comparator.comparingDouble(JobApplication::getScreeningScore).reversed())
                .toList();
    }

    /**
     * Selecciona los mejores N candidatos para pasar a entrevista teorica.
     * @return lista de candidatos seleccionados
     */
    public List<JobApplication> selectBestCandidates() {
        List<JobApplication> topScored = getTopScoredApplications();
        int count = selectedCandidatesCount != null ? selectedCandidatesCount : 1;
        return topScored.stream().limit(count).toList();
    }

    // Getters para nuevos campos

    public Integer getMaxApplicants() {
        return maxApplicants;
    }

    public Instant getClosingDate() {
        return closingDate;
    }

    public Double getRequiredScoreThreshold() {
        return requiredScoreThreshold;
    }

    public Integer getSelectedCandidatesCount() {
        return selectedCandidatesCount;
    }

    public SelectionMode getSelectionMode() {
        return selectionMode;
    }
}
