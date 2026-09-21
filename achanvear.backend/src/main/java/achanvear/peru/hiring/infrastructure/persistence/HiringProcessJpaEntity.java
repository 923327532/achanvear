package achanvear.peru.hiring.infrastructure.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "hiring_processes")
public class HiringProcessJpaEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private String id;

    @Column(name = "job_id", nullable = false)
    private String jobId;

    @Column(name = "candidate_id", nullable = false)
    private String candidateId;

    @Column(name = "stage", nullable = false)
    private String stage;

    @Column(name = "theory_interview_pass_score", nullable = false)
    private Integer theoryInterviewPassScore;

    @Column(name = "technical_interview_pass_score", nullable = false)
    private Integer technicalInterviewPassScore;

    @Column(name = "max_candidates_per_screening_request", nullable = false)
    private Integer maxCandidatesPerScreeningRequest;

    @Column(name = "theory_interview_id_used", nullable = false)
    private Boolean theoryInterviewIdUsed;

    @Column(name = "technical_interview_id_used", nullable = false)
    private Boolean technicalInterviewIdUsed;

    // Campos de seguimiento de seleccion
    @Column(name = "selected_candidates", columnDefinition = "TEXT")
    private String selectedCandidates;

    @Column(name = "rejected_candidates", columnDefinition = "TEXT")
    private String rejectedCandidates;

    @Column(name = "schedule_ids", columnDefinition = "TEXT")
    private String scheduleIds;

    @Column(name = "final_report", columnDefinition = "TEXT")
    private String finalReport;

    public HiringProcessJpaEntity() {
    }

    public HiringProcessJpaEntity(
            String id,
            String jobId,
            String candidateId,
            String stage,
            Integer theoryInterviewPassScore,
            Integer technicalInterviewPassScore,
            Integer maxCandidatesPerScreeningRequest,
            Boolean theoryInterviewIdUsed,
            Boolean technicalInterviewIdUsed,
            String selectedCandidates,
            String rejectedCandidates,
            String scheduleIds,
            String finalReport
    ) {
        this.id = id;
        this.jobId = jobId;
        this.candidateId = candidateId;
        this.stage = stage;
        this.theoryInterviewPassScore = theoryInterviewPassScore;
        this.technicalInterviewPassScore = technicalInterviewPassScore;
        this.maxCandidatesPerScreeningRequest = maxCandidatesPerScreeningRequest;
        this.theoryInterviewIdUsed = theoryInterviewIdUsed;
        this.technicalInterviewIdUsed = technicalInterviewIdUsed;
        this.selectedCandidates = selectedCandidates;
        this.rejectedCandidates = rejectedCandidates;
        this.scheduleIds = scheduleIds;
        this.finalReport = finalReport;
    }

    public String getId() {
        return id;
    }

    public String getJobId() {
        return jobId;
    }

    public String getCandidateId() {
        return candidateId;
    }

    public String getStage() {
        return stage;
    }

    public Integer getTheoryInterviewPassScore() {
        return theoryInterviewPassScore;
    }

    public Integer getTechnicalInterviewPassScore() {
        return technicalInterviewPassScore;
    }

    public Integer getMaxCandidatesPerScreeningRequest() {
        return maxCandidatesPerScreeningRequest;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
    }

    public void setCandidateId(String candidateId) {
        this.candidateId = candidateId;
    }

    public void setStage(String stage) {
        this.stage = stage;
    }

    public void setTheoryInterviewPassScore(Integer theoryInterviewPassScore) {
        this.theoryInterviewPassScore = theoryInterviewPassScore;
    }

    public void setTechnicalInterviewPassScore(Integer technicalInterviewPassScore) {
        this.technicalInterviewPassScore = technicalInterviewPassScore;
    }

    public void setMaxCandidatesPerScreeningRequest(Integer maxCandidatesPerScreeningRequest) {
        this.maxCandidatesPerScreeningRequest = maxCandidatesPerScreeningRequest;
    }

    public Boolean getTheoryInterviewIdUsed() {
        return theoryInterviewIdUsed;
    }

    public void setTheoryInterviewIdUsed(Boolean theoryInterviewIdUsed) {
        this.theoryInterviewIdUsed = theoryInterviewIdUsed;
    }

    public Boolean getTechnicalInterviewIdUsed() {
        return technicalInterviewIdUsed;
    }

    public void setTechnicalInterviewIdUsed(Boolean technicalInterviewIdUsed) {
        this.technicalInterviewIdUsed = technicalInterviewIdUsed;
    }

    // Getters y setters para campos de seguimiento

    public String getSelectedCandidates() {
        return selectedCandidates;
    }

    public void setSelectedCandidates(String selectedCandidates) {
        this.selectedCandidates = selectedCandidates;
    }

    public String getRejectedCandidates() {
        return rejectedCandidates;
    }

    public void setRejectedCandidates(String rejectedCandidates) {
        this.rejectedCandidates = rejectedCandidates;
    }

    public String getScheduleIds() {
        return scheduleIds;
    }

    public void setScheduleIds(String scheduleIds) {
        this.scheduleIds = scheduleIds;
    }

    public String getFinalReport() {
        return finalReport;
    }

    public void setFinalReport(String finalReport) {
        this.finalReport = finalReport;
    }
}
