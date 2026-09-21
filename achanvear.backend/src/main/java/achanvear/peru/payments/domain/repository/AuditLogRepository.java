package achanvear.peru.payments.domain.repository;

import achanvear.peru.payments.domain.model.AuditLog;
import achanvear.peru.payments.domain.model.AuditLogId;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface AuditLogRepository {
    void save(AuditLog auditLog);
    List<AuditLog> findByUserId(UUID userId);
    List<AuditLog> findByAction(String action);
    List<AuditLog> findByEntityTypeAndEntityId(String entityType, String entityId);
    List<AuditLog> findByDateRange(Instant from, Instant to);
}
