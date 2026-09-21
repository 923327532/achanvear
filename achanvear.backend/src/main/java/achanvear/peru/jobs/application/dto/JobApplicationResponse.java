package achanvear.peru.jobs.application.dto;

import java.time.Instant;
import java.util.UUID;

/**
 * DTO representing a job application response.
 * Contains all relevant information about a candidate's application.
 */
public record JobApplicationResponse(
        String id,
        UUID candidateUserId,
        String candidateName,
        String candidateEmail,
        String cvUrl,
        String coverLetter,
        Instant appliedAt,
        String status
) {
}
