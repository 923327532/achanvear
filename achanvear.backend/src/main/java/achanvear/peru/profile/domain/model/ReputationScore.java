package achanvear.peru.profile.domain.model;

import achanvear.peru.shared.domain.ValueObject;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Objects;

public record ReputationScore(
        BigDecimal averageStars,
        BigDecimal recommendationPercentage,
        int totalRatings
) implements ValueObject {

    public ReputationScore {
        Objects.requireNonNull(averageStars, "Average stars cannot be null");
        Objects.requireNonNull(recommendationPercentage, "Recommendation percentage cannot be null");

        if (averageStars.compareTo(BigDecimal.ZERO) < 0 || averageStars.compareTo(new BigDecimal("5.00")) > 0) {
            throw new IllegalArgumentException("Average stars must be between 0 and 5");
        }

        if (recommendationPercentage.compareTo(BigDecimal.ZERO) < 0
                || recommendationPercentage.compareTo(new BigDecimal("100.00")) > 0) {
            throw new IllegalArgumentException("Recommendation percentage must be between 0 and 100");
        }

        if (totalRatings < 0) {
            throw new IllegalArgumentException("Total ratings cannot be negative");
        }
    }

    public static ReputationScore empty() {
        return new ReputationScore(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP),
                BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP),
                0);
    }

    public static ReputationScore fromRatings(List<ProfileRating> ratings) {
        if (ratings == null || ratings.isEmpty()) {
            return empty();
        }

        BigDecimal totalStars = ratings.stream()
                .map(rating -> BigDecimal.valueOf(rating.getStars()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long recommendedCount = ratings.stream()
                .filter(ProfileRating::isRecommended)
                .count();

        BigDecimal averageStars = totalStars
                .divide(BigDecimal.valueOf(ratings.size()), 2, RoundingMode.HALF_UP);

        BigDecimal recommendationPercentage = BigDecimal.valueOf(recommendedCount)
                .multiply(new BigDecimal("100"))
                .divide(BigDecimal.valueOf(ratings.size()), 2, RoundingMode.HALF_UP);

        return new ReputationScore(averageStars, recommendationPercentage, ratings.size());
    }
}