package achanvear.peru.interview.infrastructure.persistence.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "answers")
public class AnswerJpaEntity {
    
    @Id
    @Column(name = "id")
    private String id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id", nullable = false)
    private InterviewJpaEntity interview;
    
    @Column(name = "question_id", nullable = false)
    private String questionId;
    
    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @Column(name = "answered_at", nullable = false)
    private Instant answeredAt;
    
    @Column(name = "created_at")
    private Instant createdAt;
    
    // Default constructor
    public AnswerJpaEntity() {}
    
    // Constructor with required fields
    public AnswerJpaEntity(String id, InterviewJpaEntity interview, String questionId, String content, Instant answeredAt) {
        this.id = id;
        this.interview = interview;
        this.questionId = questionId;
        this.content = content;
        this.answeredAt = answeredAt;
        this.createdAt = Instant.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public InterviewJpaEntity getInterview() { return interview; }
    public void setInterview(InterviewJpaEntity interview) { this.interview = interview; }
    
    public String getQuestionId() { return questionId; }
    public void setQuestionId(String questionId) { this.questionId = questionId; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public Instant getAnsweredAt() { return answeredAt; }
    public void setAnsweredAt(Instant answeredAt) { this.answeredAt = answeredAt; }
    
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
