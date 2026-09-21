package achanvear.peru.admin.application.dto;

import java.util.List;

public record AuditLogPageResponse(
        List<AuditLogResponse> items,
        long totalItems,
        int totalPages,
        int page,
        int size
) {
}
