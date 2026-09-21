package achanvear.peru.jobs.domain.event;

import achanvear.peru.jobs.domain.model.JobPostId;
import achanvear.peru.shared.domain.DomainEvent;

import java.time.Instant;
import java.util.Objects;

public record JobPublishedEvent(
        JobPostId jobPostId,
        String title,
        Instant occurredAt
) implements DomainEvent {

    public JobPublishedEvent {
        Objects.requireNonNull(jobPostId, "Job post id cannot be null");
        Objects.requireNonNull(title, "Title cannot be null");
        Objects.requireNonNull(occurredAt, "Occurred at cannot be null");
    }

    public static JobPublishedEvent now(JobPostId jobPostId, String title) {
        return new JobPublishedEvent(jobPostId, title, Instant.now());
    }
}