package achanvear.peru.profile.application.dto;

import java.math.BigDecimal;

public record ReputationScoreResponse(
        BigDecimal averageStars,
        BigDecimal recommendationPercentage,
        int totalRatings
) {
}