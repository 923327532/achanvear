package achanvear.peru.interview.infrastructure.persistence.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.BatchSize;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "interviews")
public class InterviewJpaEntity {

    @Id
    @Column(name = "id")
    private String id;

    @Column(name = "hiring_process_id", nullable = false)
    private String hiringProcessId;

    @Column(name = "candidate_id", nullable = false)
    private String candidateId;

    @Column(name = "interview_type", nullable = false)
    private String interviewType;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "interviewer_code")
    private String interviewerCode;

    @Column(name = "interviewer_name")
    private String interviewerName;

    @Column(name = "interviewer_style")
    private String interviewerStyle;

    @Column(name = "interviewer_voice")
    private String interviewerVoice;

    @Column(name = "score")
    private Integer score;

    @Column(name = "recording_file_key")
    private String recordingFileKey;

    @Column(name = "recording_active")
    private Boolean recordingActive;

    @Column(name = "python_session_id")
    private String pythonSessionId;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @OneToMany(mappedBy = "interview", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @BatchSize(size = 50)
    @OrderBy("orderNumber ASC")
    private List<QuestionJpaEntity> questions = new ArrayList<>();

    @OneToMany(mappedBy = "interview", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @BatchSize(size = 50)
    @OrderBy("answeredAt ASC")
    private List<AnswerJpaEntity> answers = new ArrayList<>();

    @OneToMany(mappedBy = "interview", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @BatchSize(size = 50)
    @OrderBy("occurredAt ASC")
    private List<InterviewViolationJpaEntity> violations = new ArrayList<>();

    public InterviewJpaEntity() {}

    public InterviewJpaEntity(String id, String hiringProcessId, String candidateId,
                              String interviewType, String status) {
        this.id = id;
        this.hiringProcessId = hiringProcessId;
        this.candidateId = candidateId;
        this.interviewType = interviewType;
        this.status = status;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
        if (this.updatedAt == null) {
            this.updatedAt = Instant.now();
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getHiringProcessId() { return hiringProcessId; }
    public void setHiringProcessId(String hiringProcessId) { this.hiringProcessId = hiringProcessId; }

    public String getCandidateId() { return candidateId; }
    public void setCandidateId(String candidateId) { this.candidateId = candidateId; }

    public String getInterviewType() { return interviewType; }
    public void setInterviewType(String interviewType) { this.interviewType = interviewType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getInterviewerCode() { return interviewerCode; }
    public void setInterviewerCode(String interviewerCode) { this.interviewerCode = interviewerCode; }

    public String getInterviewerName() { return interviewerName; }
    public void setInterviewerName(String interviewerName) { this.interviewerName = interviewerName; }

    public String getInterviewerStyle() { return interviewerStyle; }
    public void setInterviewerStyle(String interviewerStyle) { this.interviewerStyle = interviewerStyle; }

    public String getInterviewerVoice() { return interviewerVoice; }
    public void setInterviewerVoice(String interviewerVoice) { this.interviewerVoice = interviewerVoice; }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    public String getRecordingFileKey() { return recordingFileKey; }
    public void setRecordingFileKey(String recordingFileKey) { this.recordingFileKey = recordingFileKey; }

    public Boolean getRecordingActive() { return recordingActive; }
    public void setRecordingActive(Boolean recordingActive) { this.recordingActive = recordingActive; }

    public String getPythonSessionId() { return pythonSessionId; }
    public void setPythonSessionId(String pythonSessionId) { this.pythonSessionId = pythonSessionId; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public List<QuestionJpaEntity> getQuestions() { return questions; }
    public void setQuestions(List<QuestionJpaEntity> questions) { this.questions = questions; }

    public List<AnswerJpaEntity> getAnswers() { return answers; }
    public void setAnswers(List<AnswerJpaEntity> answers) { this.answers = answers; }

    public List<InterviewViolationJpaEntity> getViolations() { return violations; }
    public void setViolations(List<InterviewViolationJpaEntity> violations) { this.violations = violations; }
}