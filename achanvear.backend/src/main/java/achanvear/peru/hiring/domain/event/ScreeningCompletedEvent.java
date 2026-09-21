package achanvear.peru.hiring.domain.event;

import achanvear.peru.shared.domain.DomainEvent;

import java.time.Instant;
import java.util.Objects;

public record ScreeningCompletedEvent(
        String hiringProcessId,
        String jobId,
        String candidateId,
        boolean selected,
        Double score,
        String summary,
        Instant occurredAt
) implements DomainEvent {

    public ScreeningCompletedEvent {
        Objects.requireNonNull(hiringProcessId, "Hiring process id cannot be null");
        Objects.requireNonNull(jobId, "Job id cannot be null");
        Objects.requireNonNull(candidateId, "Candidate id cannot be null");
        Objects.requireNonNull(occurredAt, "Occurred at cannot be null");
    }
}