package achanvear.peru.hiring.domain.model;

import achanvear.peru.hiring.domain.event.ScreeningCompletedEvent;
import achanvear.peru.hiring.domain.event.TechnicalInterviewDoneEvent;
import achanvear.peru.hiring.domain.event.TheoryInterviewPassedEvent;
import achanvear.peru.shared.domain.DomainEvent;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class HiringProcess {

    private final HiringProcessId id;
    private final String jobId;
    private final String candidateId;
    private HiringStage stage;
    private final HiringConfig config;
    private boolean theoryInterviewIdUsed;
    private boolean technicalInterviewIdUsed;
    private final List<DomainEvent> domainEvents = new ArrayList<>();

    // Campos de seguimiento de seleccion
    private List<String> selectedCandidates;
    private List<String> rejectedCandidates;
    private List<String> scheduleIds;
    private String finalReport;

    public HiringProcess(HiringProcessId id, String jobId, String candidateId, HiringStage stage, HiringConfig config) {
        this.id = Objects.requireNonNull(id, "Hiring process id cannot be null");
        this.jobId = Objects.requireNonNull(jobId, "Job id cannot be null");
        this.candidateId = Objects.requireNonNull(candidateId, "Candidate id cannot be null");
        this.stage = Objects.requireNonNull(stage, "Hiring stage cannot be null");
        this.config = Objects.requireNonNull(config, "Hiring config cannot be null");
        this.theoryInterviewIdUsed = false;
        this.technicalInterviewIdUsed = false;
        this.selectedCandidates = new ArrayList<>();
        this.rejectedCandidates = new ArrayList<>();
        this.scheduleIds = new ArrayList<>();
        this.finalReport = null;
    }

    public static HiringProcess create(HiringProcessId id, String jobId, String candidateId, HiringConfig config) {
        return new HiringProcess(id, jobId, candidateId, HiringStage.PENDING, config);
    }

    public void startScreening() {
        ensureStage(HiringStage.PENDING);
        this.stage = HiringStage.SCREENING;
    }

    public void completeScreening(boolean selected, Double score, String summary) {
        ensureStage(HiringStage.SCREENING);

        if (selected) {
            this.stage = HiringStage.THEORY_INTERVIEW;
        } else {
            this.stage = HiringStage.REJECTED;
        }

        this.domainEvents.add(new ScreeningCompletedEvent(
                this.id.toString(),
                this.jobId,
                this.candidateId,
                selected,
                score,
                summary,
                Instant.now()
        ));
    }

    public void registerTheoryInterviewResult(int score) {
        ensureStage(HiringStage.THEORY_INTERVIEW);

        if (score >= config.getTheoryInterviewPassScore()) {
            this.stage = HiringStage.TECHNICAL_INTERVIEW;
            this.domainEvents.add(new TheoryInterviewPassedEvent(
                    this.id.toString(),
                    this.jobId,
                    this.candidateId,
                    score,
                    Instant.now()
            ));
            return;
        }

        this.stage = HiringStage.REJECTED;
    }

    public void registerTechnicalInterviewResult(int score, boolean approved) {
        ensureStage(HiringStage.TECHNICAL_INTERVIEW);

        this.stage = approved ? HiringStage.UNDER_REVIEW : HiringStage.REJECTED;

        this.domainEvents.add(new TechnicalInterviewDoneEvent(
                this.id.toString(),
                this.jobId,
                this.candidateId,
                score,
                approved,
                Instant.now()
        ));
    }

    public void approve() {
        ensureStage(HiringStage.UNDER_REVIEW);
        this.stage = HiringStage.APPROVED;
    }

    public void reject() {
        if (this.stage == HiringStage.HIRED) {
            throw new IllegalStateException("Cannot reject a hired candidate");
        }
        this.stage = HiringStage.REJECTED;
    }

    public void hire() {
        ensureStage(HiringStage.APPROVED);
        this.stage = HiringStage.HIRED;
    }

    public List<DomainEvent> pullDomainEvents() {
        List<DomainEvent> events = new ArrayList<>(this.domainEvents);
        this.domainEvents.clear();
        return events;
    }

    private void ensureStage(HiringStage expectedStage) {
        if (this.stage != expectedStage) {
            throw new IllegalStateException("Hiring process is not in expected stage: " + expectedStage);
        }
    }

    public HiringProcessId getId() {
        return id;
    }

    public String getJobId() {
        return jobId;
    }

    public String getCandidateId() {
        return candidateId;
    }

    public HiringStage getStage() {
        return stage;
    }

    public HiringConfig getConfig() {
        return config;
    }

    /**
     * Verifica si el ID de entrevista teorica ya fue usado.
     * El ID es de un solo uso para evitar reingresos.
     */
    public boolean isTheoryInterviewIdUsed() {
        return theoryInterviewIdUsed;
    }

    /**
     * Marca el ID de entrevista teorica como usado.
     * Solo se puede llamar una vez, lanza excepcion si ya fue usado.
     */
    public void markTheoryInterviewIdAsUsed() {
        if (theoryInterviewIdUsed) {
            throw new IllegalStateException("Theory interview ID already used for process: " + this.id);
        }
        this.theoryInterviewIdUsed = true;
    }

    /**
     * Verifica si el ID de entrevista tecnica ya fue usado.
     * El ID es de un solo uso para evitar reingresos.
     */
    public boolean isTechnicalInterviewIdUsed() {
        return technicalInterviewIdUsed;
    }

    /**
     * Marca el ID de entrevista tecnica como usado.
     * Solo se puede llamar una vez, lanza excepcion si ya fue usado.
     */
    public void markTechnicalInterviewIdAsUsed() {
        if (technicalInterviewIdUsed) {
            throw new IllegalStateException("Technical interview ID already used for process: " + this.id);
        }
        this.technicalInterviewIdUsed = true;
    }

    // ========== Metodos de seguimiento de seleccion ==========

    /**
     * Agrega un candidato a la lista de seleccionados.
     */
    public void addSelectedCandidate(String candidateId) {
        if (!this.selectedCandidates.contains(candidateId)) {
            this.selectedCandidates.add(candidateId);
        }
    }

    /**
     * Agrega un candidato a la lista de rechazados.
     */
    public void addRejectedCandidate(String candidateId) {
        if (!this.rejectedCandidates.contains(candidateId)) {
            this.rejectedCandidates.add(candidateId);
        }
    }

    /**
     * Agrega un ID de schedule de entrevista.
     */
    public void addScheduleId(String scheduleId) {
        if (!this.scheduleIds.contains(scheduleId)) {
            this.scheduleIds.add(scheduleId);
        }
    }

    /**
     * Establece el reporte final del proceso.
     */
    public void setFinalReport(String finalReport) {
        this.finalReport = finalReport;
    }

    // Getters

    public List<String> getSelectedCandidates() {
        return selectedCandidates != null ? List.copyOf(selectedCandidates) : List.of();
    }

    public List<String> getRejectedCandidates() {
        return rejectedCandidates != null ? List.copyOf(rejectedCandidates) : List.of();
    }

    public List<String> getScheduleIds() {
        return scheduleIds != null ? List.copyOf(scheduleIds) : List.of();
    }

    public String getFinalReport() {
        return finalReport;
    }
}
