package achanvear.peru.jobs.application.dto;

import java.time.Instant;

public record ApplicationResponse(
        String id,
        String candidateUserId,
        String cvUrl,
        String coverLetter,
        Instant appliedAt,
        String status
) {
}