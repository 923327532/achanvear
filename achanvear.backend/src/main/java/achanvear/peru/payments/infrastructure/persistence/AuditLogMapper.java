package achanvear.peru.payments.infrastructure.persistence;

import achanvear.peru.payments.domain.model.AuditLog;
import achanvear.peru.payments.domain.model.AuditLogId;
import org.springframework.stereotype.Component;

@Component
public class AuditLogMapper {

    public AuditLogJpaEntity toEntity(AuditLog auditLog) {
        AuditLogJpaEntity entity = new AuditLogJpaEntity();
        entity.setId(auditLog.getId().value());
        entity.setUserId(auditLog.getUserId());
        entity.setAction(auditLog.getAction());
        entity.setEntityType(auditLog.getEntityType());
        entity.setEntityId(auditLog.getEntityId());
        entity.setOldValue(auditLog.getOldValue());
        entity.setNewValue(auditLog.getNewValue());
        entity.setIpAddress(auditLog.getIpAddress());
        entity.setUserAgent(auditLog.getUserAgent());
        entity.setMetadata(auditLog.getMetadata());
        return entity;
    }

    public AuditLog toDomain(AuditLogJpaEntity entity) {
        return new AuditLog(
                new AuditLogId(entity.getId()),
                entity.getUserId(),
                entity.getAction(),
                entity.getEntityType(),
                entity.getEntityId(),
                entity.getOldValue(),
                entity.getNewValue(),
                entity.getIpAddress(),
                entity.getUserAgent(),
                entity.getMetadata()
        );
    }
}
