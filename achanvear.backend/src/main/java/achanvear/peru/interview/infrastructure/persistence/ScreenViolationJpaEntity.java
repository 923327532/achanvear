package achanvear.peru.interview.infrastructure.persistence;

import achanvear.peru.interview.infrastructure.persistence.entity.InterviewJpaEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "interview_screen_violations")
public class ScreenViolationJpaEntity {

    @Id
    @Column(nullable = false, updatable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "interview_id", nullable = false)
    private InterviewJpaEntity interview;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private Integer count;

    @Column(nullable = false)
    private Instant occurredAt;

    public ScreenViolationJpaEntity() {
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

    public Integer getCount() {
        return count;
    }

    public Instant getOccurredAt() {
        return occurredAt;
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

    public void setCount(Integer count) {
        this.count = count;
    }

    public void setOccurredAt(Instant occurredAt) {
        this.occurredAt = occurredAt;
    }
}
