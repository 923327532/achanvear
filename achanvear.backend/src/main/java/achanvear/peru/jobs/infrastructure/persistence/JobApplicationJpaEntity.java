package achanvear.peru.jobs.infrastructure.persistence;

import achanvear.peru.shared.infrastructure.BaseJpaEntity;
import jakarta.persistence.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "job_applications")
public class JobApplicationJpaEntity extends BaseJpaEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "job_post_id", nullable = false)
    private UUID jobPostId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_post_id", nullable = false, insertable = false, updatable = false)
    private JobPostJpaEntity jobPost;

    @Column(name = "candidate_user_id", nullable = false)
    private UUID candidateUserId;

    @Column(name = "cv_url", nullable = false, length = 500)
    private String cvUrl;

    @Column(name = "cover_letter", length = 2000)
    private String coverLetter;

    @Column(name = "applied_at", nullable = false)
    private Instant appliedAt;

    @Column(name = "status", nullable = false, length = 30)
    private String status;

    // Campos de scoring
    @Column(name = "screening_score")
    private Double screeningScore;

    @Column(name = "screening_result")
    private Boolean screeningResult;

    @Column(name = "theory_score")
    private Integer theoryScore;

    @Column(name = "technical_score")
    private Integer technicalScore;

    @Column(name = "final_status", length = 30)
    private String finalStatus;

    public JobApplicationJpaEntity() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public JobPostJpaEntity getJobPost() {
        return jobPost;
    }

    public void setJobPost(JobPostJpaEntity jobPost) {
        this.jobPost = jobPost;
    }

    public UUID getJobPostId() {
        return jobPostId;
    }

    public void setJobPostId(UUID jobPostId) {
        this.jobPostId = jobPostId;
    }

    public UUID getCandidateUserId() {
        return candidateUserId;
    }

    public void setCandidateUserId(UUID candidateUserId) {
        this.candidateUserId = candidateUserId;
    }

    public String getCvUrl() {
        return cvUrl;
    }

    public void setCvUrl(String cvUrl) {
        this.cvUrl = cvUrl;
    }

    public String getCoverLetter() {
        return coverLetter;
    }

    public void setCoverLetter(String coverLetter) {
        this.coverLetter = coverLetter;
    }

    public Instant getAppliedAt() {
        return appliedAt;
    }

    public void setAppliedAt(Instant appliedAt) {
        this.appliedAt = appliedAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    // Getters y setters para campos de scoring

    public Double getScreeningScore() {
        return screeningScore;
    }

    public void setScreeningScore(Double screeningScore) {
        this.screeningScore = screeningScore;
    }

    public Boolean getScreeningResult() {
        return screeningResult;
    }

    public void setScreeningResult(Boolean screeningResult) {
        this.screeningResult = screeningResult;
    }

    public Integer getTheoryScore() {
        return theoryScore;
    }

    public void setTheoryScore(Integer theoryScore) {
        this.theoryScore = theoryScore;
    }

    public Integer getTechnicalScore() {
        return technicalScore;
    }

    public void setTechnicalScore(Integer technicalScore) {
        this.technicalScore = technicalScore;
    }

    public String getFinalStatus() {
        return finalStatus;
    }

    public void setFinalStatus(String finalStatus) {
        this.finalStatus = finalStatus;
    }
}
