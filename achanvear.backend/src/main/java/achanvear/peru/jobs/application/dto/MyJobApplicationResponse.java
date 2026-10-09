package achanvear.peru.jobs.application.dto;

import java.time.Instant;

public record MyJobApplicationResponse(
        String id,
        String jobPostId,
        String jobTitle,
        String companyName,
        Instant appliedAt,
        String status,
        String currentStage,
        Double screeningScore,
        Boolean screeningResult,
        String screeningSummary
) {
}
