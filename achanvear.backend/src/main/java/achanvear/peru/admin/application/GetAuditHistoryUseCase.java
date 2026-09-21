package achanvear.peru.admin.application;

import achanvear.peru.admin.application.dto.AuditLogPageResponse;

public interface GetAuditHistoryUseCase {

    AuditLogPageResponse getHistory(int page, int size);
}
