package achanvear.peru.payments.application.dto;

public record AuditLogResponse(
        String id,
        String userId,
        String action,
        String entityType,
        String entityId,
        String oldValue,
        String newValue,
        String ipAddress,
        String metadata,
        String createdAt
) {
}
