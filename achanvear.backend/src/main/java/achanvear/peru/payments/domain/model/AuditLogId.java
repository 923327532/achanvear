package achanvear.peru.payments.domain.model;

import java.util.UUID;

public record AuditLogId(UUID value) {
    public AuditLogId {
        if (value == null) {
            throw new IllegalArgumentException("AuditLogId value must not be null");
        }
    }
}
