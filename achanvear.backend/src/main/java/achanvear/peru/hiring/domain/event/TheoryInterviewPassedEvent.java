package achanvear.peru.hiring.domain.event;

import achanvear.peru.shared.domain.DomainEvent;

import java.time.Instant;
import java.util.Objects;

public record TheoryInterviewPassedEvent(
        String hiringProcessId,
        String jobId,
        String candidateId,
        int score,
        Instant occurredAt
) implements DomainEvent {

    public TheoryInterviewPassedEvent {
        Objects.requireNonNull(hiringProcessId, "Hiring process id cannot be null");
        Objects.requireNonNull(jobId, "Job id cannot be null");
        Objects.requireNonNull(candidateId, "Candidate id cannot be null");
        Objects.requireNonNull(occurredAt, "Occurred at cannot be null");
    }
}