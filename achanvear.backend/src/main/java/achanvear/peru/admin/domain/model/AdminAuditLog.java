package achanvear.peru.admin.domain.model;

import java.time.Instant;
import java.util.Objects;

/**
 * Registro de auditoría de acciones administrativas relevantes.
 */
public class AdminAuditLog {

    private final String id;
    private final String adminUserId;
    private final AuditAction action;
    private final String resourceType;
    private final String resourceId;
    private final String metadata;
    private final Instant createdAt;

    private AdminAuditLog(
            String id,
            String adminUserId,
            AuditAction action,
            String resourceType,
            String resourceId,
            String metadata,
            Instant createdAt
    ) {
        this.id = Objects.requireNonNull(id, "Audit log id cannot be null");
        this.adminUserId = Objects.requireNonNull(adminUserId, "Admin user id cannot be null");
        this.action = Objects.requireNonNull(action, "Action cannot be null");
        this.resourceType = resourceType;
        this.resourceId = resourceId;
        this.metadata = metadata;
        this.createdAt = createdAt != null ? createdAt : Instant.now();
    }

    public static AdminAuditLog create(
            String adminUserId,
            AuditAction action,
            String resourceType,
            String resourceId,
            String metadata
    ) {
        return new AdminAuditLog(
                java.util.UUID.randomUUID().toString(),
                adminUserId,
                action,
                resourceType,
                resourceId,
                metadata,
                Instant.now()
        );
    }

    public static AdminAuditLog restore(
            String id,
            String adminUserId,
            AuditAction action,
            String resourceType,
            String resourceId,
            String metadata,
            Instant createdAt
    ) {
        return new AdminAuditLog(id, adminUserId, action, resourceType, resourceId, metadata, createdAt);
    }

    public String getId() {
        return id;
    }

    public String getAdminUserId() {
        return adminUserId;
    }

    public AuditAction getAction() {
        return action;
    }

    public String getResourceType() {
        return resourceType;
    }

    public String getResourceId() {
        return resourceId;
    }

    public String getMetadata() {
        return metadata;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
