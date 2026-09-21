package achanvear.peru.jobs.domain.model;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

public class JobApplication {

    private final JobApplicationId id;
    private final UUID jobPostId;
    private final UUID candidateUserId;
    private final String cvUrl;
    private final String coverLetter;
    private final Instant appliedAt;
    private ApplicationStatus status;

    // Campos de scoring
    private Double screeningScore;
    private Boolean screeningResult;
    private Integer theoryScore;
    private Integer technicalScore;
    private String finalStatus;

    private JobApplication(
            JobApplicationId id,
            UUID jobPostId,
            UUID candidateUserId,
            String cvUrl,
            String coverLetter,
            Instant appliedAt,
            ApplicationStatus status,
            Double screeningScore,
            Boolean screeningResult,
            Integer theoryScore,
            Integer technicalScore,
            String finalStatus
    ) {
        this.id = Objects.requireNonNull(id, "Job application id cannot be null");
        this.jobPostId = Objects.requireNonNull(jobPostId, "Job post id cannot be null");
        this.candidateUserId = Objects.requireNonNull(candidateUserId, "Candidate user id cannot be null");
        this.cvUrl = normalizeOptionalText(cvUrl);
        this.coverLetter = validateRequiredText(coverLetter, "Cover letter", 10, 2000);
        this.appliedAt = Objects.requireNonNull(appliedAt, "Applied at cannot be null");
        this.status = Objects.requireNonNull(status, "Application status cannot be null");
        this.screeningScore = screeningScore;
        this.screeningResult = screeningResult;
        this.theoryScore = theoryScore;
        this.technicalScore = technicalScore;
        this.finalStatus = finalStatus;
    }

    public static JobApplication create(
            UUID jobPostId,
            UUID candidateUserId,
            String cvUrl,
            String coverLetter
    ) {
        return new JobApplication(
                JobApplicationId.generate(),
                jobPostId,
                candidateUserId,
                cvUrl,
                coverLetter,
                Instant.now(),
                ApplicationStatus.SUBMITTED,
                null,
                null,
                null,
                null,
                null
        );
    }

    public static JobApplication restore(
            JobApplicationId id,
            UUID jobPostId,
            UUID candidateUserId,
            String cvUrl,
            String coverLetter,
            Instant appliedAt,
            ApplicationStatus status,
            Double screeningScore,
            Boolean screeningResult,
            Integer theoryScore,
            Integer technicalScore,
            String finalStatus
    ) {
        return new JobApplication(id, jobPostId, candidateUserId, cvUrl, coverLetter, appliedAt, status,
                screeningScore, screeningResult, theoryScore, technicalScore, finalStatus);
    }

    public void changeStatus(ApplicationStatus newStatus) {
        Objects.requireNonNull(newStatus, "New application status cannot be null");

        if (this.status == newStatus) {
            throw new IllegalArgumentException("Application already has the requested status");
        }

        this.status = newStatus;
    }

    public JobApplicationId getId() {
        return id;
    }

    public UUID getJobPostId() {
        return jobPostId;
    }

    public UUID getCandidateUserId() {
        return candidateUserId;
    }

    public String getCvUrl() {
        return cvUrl;
    }

    public String getCoverLetter() {
        return coverLetter;
    }

    public Instant getAppliedAt() {
        return appliedAt;
    }

    public ApplicationStatus getStatus() {
        return status;
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

    private static String normalizeOptionalText(String value) {
        if (value == null) {
            return null;
        }

        String normalizedValue = value.trim();
        return normalizedValue.isBlank() ? null : normalizedValue;
    }

    // ========== Metodos de scoring ==========

    /**
     * Registra el resultado del screening realizado por Python.
     * Java solo almacena el resultado, no calcula nada.
     */
    public void registerScreeningResult(double score, boolean passed) {
        this.screeningScore = score;
        this.screeningResult = passed;
        this.status = passed ? ApplicationStatus.SHORTLISTED : ApplicationStatus.REJECTED;
    }

    /**
     * Registra el score de la entrevista teorica.
     */
    public void registerTheoryScore(int score) {
        this.theoryScore = score;
    }

    /**
     * Registra el score de la entrevista tecnica.
     */
    public void registerTechnicalScore(int score) {
        this.technicalScore = score;
    }

    /**
     * Marca el estado final del candidato en este proceso.
     */
    public void markFinalStatus(String finalStatus) {
        this.finalStatus = finalStatus;
    }

    // Getters para campos de scoring

    public Double getScreeningScore() {
        return screeningScore;
    }

    public Boolean getScreeningResult() {
        return screeningResult;
    }

    public Integer getTheoryScore() {
        return theoryScore;
    }

    public Integer getTechnicalScore() {
        return technicalScore;
    }

    public String getFinalStatus() {
        return finalStatus;
    }
}
