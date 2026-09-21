package achanvear.peru.interview.domain.event;

import achanvear.peru.shared.domain.DomainEvent;
import achanvear.peru.interview.domain.model.InterviewId;

import java.time.Instant;

public record InterviewCompletedEvent(
        InterviewId interviewId,
        String interviewType,
        Integer finalScore,
        boolean passed,
        Instant occurredAt
) implements DomainEvent {

    public InterviewCompletedEvent(
            InterviewId interviewId,
            String interviewType,
            Integer finalScore,
            boolean passed
    ) {
        this(interviewId, interviewType, finalScore, passed, Instant.now());
    }
}