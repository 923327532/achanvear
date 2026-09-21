package achanvear.peru.interview.domain.event;

import achanvear.peru.shared.domain.DomainEvent;
import achanvear.peru.interview.domain.model.InterviewId;

import java.time.Instant;

public record InterviewStartedEvent(
        InterviewId interviewId,
        String interviewType,
        Instant occurredAt
) implements DomainEvent {

    public InterviewStartedEvent(InterviewId interviewId, String interviewType) {
        this(interviewId, interviewType, Instant.now());
    }
}