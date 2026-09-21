package achanvear.peru.payments.application.dto;

public record DisputeResponse(
        String disputeId,
        String milestoneId,
        String projectId,
        String raisedByUserId,
        String raisedAgainstUserId,
        String reason,
        String description,
        String status,
        String resolution,
        String resolvedByUserId,
        String resolvedAt,
        String createdAt
) {
}
