package achanvear.peru.interview.infrastructure.persistence.entity;

import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "interview_violations")
public class InterviewViolationJpaEntity {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id", nullable = false)
    private InterviewJpaEntity interview;

    @Column(name = "type", nullable = false, length = 50)
    private String type;

    @Column(name = "occurrence_count", nullable = false)
    private Integer occurrenceCount;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt;

    @Column(name = "created_at")
    private Instant createdAt;

    public InterviewViolationJpaEntity() {
    }

    public InterviewViolationJpaEntity(
            String id,
            InterviewJpaEntity interview,
            String type,
            Integer occurrenceCount,
            Instant occurredAt
    ) {
        this.id = id;
        this.interview = interview;
        this.type = type;
        this.occurrenceCount = occurrenceCount;
        this.occurredAt = occurredAt;
        this.createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public InterviewJpaEntity getInterview() {
        return interview;
    }

    public String getType() {
        return type;
    }

    public Integer getOccurrenceCount() {
        return occurrenceCount;
    }

    public Instant getOccurredAt() {
        return occurredAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setInterview(InterviewJpaEntity interview) {
        this.interview = interview;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setOccurrenceCount(Integer occurrenceCount) {
        this.occurrenceCount = occurrenceCount;
    }

    public void setOccurredAt(Instant occurredAt) {
        this.occurredAt = occurredAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
