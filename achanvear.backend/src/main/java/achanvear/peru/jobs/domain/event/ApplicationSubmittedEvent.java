package achanvear.peru.jobs.domain.event;

import achanvear.peru.jobs.domain.model.JobApplicationId;
import achanvear.peru.jobs.domain.model.JobPostId;
import achanvear.peru.shared.domain.DomainEvent;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

public record ApplicationSubmittedEvent(
        JobPostId jobPostId,
        JobApplicationId applicationId,
        UUID candidateUserId,
        Instant occurredAt
) implements DomainEvent {

    public ApplicationSubmittedEvent {
        Objects.requireNonNull(jobPostId, "Job post id cannot be null");
        Objects.requireNonNull(applicationId, "Application id cannot be null");
        Objects.requireNonNull(candidateUserId, "Candidate user id cannot be null");
        Objects.requireNonNull(occurredAt, "Occurred at cannot be null");
    }

    public static ApplicationSubmittedEvent now(
            JobPostId jobPostId,
            JobApplicationId applicationId,
            UUID candidateUserId
    ) {
        return new ApplicationSubmittedEvent(jobPostId, applicationId, candidateUserId, Instant.now());
    }
}