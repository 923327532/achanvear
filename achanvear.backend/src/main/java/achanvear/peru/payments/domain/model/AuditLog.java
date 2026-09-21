package achanvear.peru.payments.domain.model;

import achanvear.peru.shared.domain.AggregateRoot;

import java.time.Instant;
import java.util.UUID;

public class AuditLog extends AggregateRoot<AuditLogId> {

    private final AuditLogId id;
    private final UUID userId;
    private final String action;
    private final String entityType;
    private final String entityId;
    private final String oldValue;
    private final String newValue;
    private final String ipAddress;
    private final String userAgent;
    private final String metadata;
    private final Instant createdAt;

    public AuditLog(
            AuditLogId id,
            UUID userId,
            String action,
            String entityType,
            String entityId,
            String oldValue,
            String newValue,
            String ipAddress,
            String userAgent,
            String metadata
    ) {
        this.id = id;
        this.userId = userId;
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.metadata = metadata;
        this.createdAt = Instant.now();
    }

    public static AuditLog create(
            UUID userId,
            String action,
            String entityType,
            String entityId,
            String oldValue,
            String newValue,
            String ipAddress,
            String userAgent,
            String metadata
    ) {
        return new AuditLog(
                new AuditLogId(UUID.randomUUID()),
                userId,
                action,
                entityType,
                entityId,
                oldValue,
                newValue,
                ipAddress,
                userAgent,
                metadata
        );
    }

    // Getters
    public AuditLogId getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getAction() { return action; }
    public String getEntityType() { return entityType; }
    public String getEntityId() { return entityId; }
    public String getOldValue() { return oldValue; }
    public String getNewValue() { return newValue; }
    public String getIpAddress() { return ipAddress; }
    public String getUserAgent() { return userAgent; }
    public String getMetadata() { return metadata; }
    public Instant getCreatedAt() { return createdAt; }
}
