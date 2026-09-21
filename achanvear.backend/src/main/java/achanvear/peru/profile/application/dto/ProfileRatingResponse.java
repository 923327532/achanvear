package achanvear.peru.profile.application.dto;

import java.time.Instant;

public record ProfileRatingResponse(
        String reviewerUserId,
        String reviewerType,
        int stars,
        boolean recommended,
        String comment,
        Instant createdAt
) {
}