package achanvear.peru.interview.infrastructure.persistence.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "questions")
public class QuestionJpaEntity {
    
    @Id
    @Column(name = "id")
    private String id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id", nullable = false)
    private InterviewJpaEntity interview;
    
    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @Column(name = "order_number", nullable = false)
    private Integer orderNumber;
    
    @Column(name = "created_at")
    private Instant createdAt;
    
    // Default constructor
    public QuestionJpaEntity() {}
    
    // Constructor with required fields
    public QuestionJpaEntity(String id, InterviewJpaEntity interview, String content, Integer orderNumber) {
        this.id = id;
        this.interview = interview;
        this.content = content;
        this.orderNumber = orderNumber;
        this.createdAt = Instant.now();
    }
    
    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public InterviewJpaEntity getInterview() { return interview; }
    public void setInterview(InterviewJpaEntity interview) { this.interview = interview; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public Integer getOrderNumber() { return orderNumber; }
    public void setOrderNumber(Integer orderNumber) { this.orderNumber = orderNumber; }
    
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
