package achanvear.peru.admin.application.dto;

import achanvear.peru.admin.domain.model.AdminAuditLog;

import java.time.Instant;

public record AuditLogResponse(
        String id,
        String adminUserId,
        String action,
        String resourceType,
        String resourceId,
        String metadata,
        Instant createdAt
) {

    public static AuditLogResponse from(AdminAuditLog log) {
        return new AuditLogResponse(
                log.getId(),
                log.getAdminUserId(),
                log.getAction().name(),
                log.getResourceType(),
                log.getResourceId(),
                log.getMetadata(),
                log.getCreatedAt()
        );
    }
}
