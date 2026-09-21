package achanvear.peru.interview.domain.model;

import java.time.Instant;

public record ScreenViolation(
        String type,
        String s, Integer count,
        Instant occurredAt
) {
}
