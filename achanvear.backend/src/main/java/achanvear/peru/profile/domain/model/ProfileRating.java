package achanvear.peru.profile.domain.model;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

public class ProfileRating {

    private final UUID reviewerUserId;
    private final RatingTargetType reviewerType;
    private final int stars;
    private final boolean recommended;
    private final String comment;
    private final Instant createdAt;

    private ProfileRating(
            UUID reviewerUserId,
            RatingTargetType reviewerType,
            int stars,
            boolean recommended,
            String comment,
            Instant createdAt
    ) {
        this.reviewerUserId = Objects.requireNonNull(reviewerUserId, "Reviewer user id cannot be null");
        this.reviewerType = Objects.requireNonNull(reviewerType, "Reviewer type cannot be null");
        this.stars = validateStars(stars);
        this.recommended = recommended;
        this.comment = normalizeOptionalText(comment);
        this.createdAt = Objects.requireNonNull(createdAt, "Created at cannot be null");
    }

    public static ProfileRating create(
            UUID reviewerUserId,
            RatingTargetType reviewerType,
            int stars,
            boolean recommended,
            String comment
    ) {
        return new ProfileRating(
                reviewerUserId,
                reviewerType,
                stars,
                recommended,
                comment,
                Instant.now()
        );
    }

    /**
     * Creates an updated rating preserving the original reviewer and createdAt.
     */
    public ProfileRating update(int stars, boolean recommended, String comment) {
        return new ProfileRating(
                this.reviewerUserId,
                this.reviewerType,
                stars,
                recommended,
                comment,
                this.createdAt
        );
    }

    public static ProfileRating restore(
            UUID reviewerUserId,
            RatingTargetType reviewerType,
            int stars,
            boolean recommended,
            String comment,
            Instant createdAt
    ) {
        return new ProfileRating(
                reviewerUserId,
                reviewerType,
                stars,
                recommended,
                comment,
                createdAt
        );
    }

    public UUID getReviewerUserId() {
        return reviewerUserId;
    }

    public RatingTargetType getReviewerType() {
        return reviewerType;
    }

    public int getStars() {
        return stars;
    }

    public boolean isRecommended() {
        return recommended;
    }

    public String getComment() {
        return comment;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    private static int validateStars(int value) {
        if (value < 1 || value > 5) {
            throw new IllegalArgumentException("Stars must be between 1 and 5");
        }

        return value;
    }

    private static String normalizeOptionalText(String value) {
        if (value == null) {
            return null;
        }

        String normalizedValue = value.trim();
        return normalizedValue.isBlank() ? null : normalizedValue;
    }
}