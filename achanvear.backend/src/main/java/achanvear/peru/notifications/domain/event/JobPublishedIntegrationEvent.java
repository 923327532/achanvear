package achanvear.peru.notifications.domain.event;

import java.time.Instant;
import java.util.Objects;

public record JobPublishedIntegrationEvent(
        String jobPostId,
        String title,
        Instant occurredAt
) {

    public JobPublishedIntegrationEvent {
        Objects.requireNonNull(jobPostId, "Job post id cannot be null");
        Objects.requireNonNull(title, "Title cannot be null");
        Objects.requireNonNull(occurredAt, "Occurred at cannot be null");
    }

    public static JobPublishedIntegrationEvent from(String jobPostId, String title) {
        return new JobPublishedIntegrationEvent(jobPostId, title, Instant.now());
    }
}
