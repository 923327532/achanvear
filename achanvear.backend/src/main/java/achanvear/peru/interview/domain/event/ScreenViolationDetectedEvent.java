package achanvear.peru.interview.domain.event;

import achanvear.peru.interview.domain.model.InterviewId;
import achanvear.peru.shared.domain.DomainEvent;

import java.time.Instant;

public record ScreenViolationDetectedEvent(
        InterviewId interviewId,
        String violationType,
        Integer count,
        Instant occurredAt
) implements DomainEvent {
}
