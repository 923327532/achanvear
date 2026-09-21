package achanvear.peru.admin.domain.repository;

import achanvear.peru.admin.domain.model.AdminAuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminAuditLogRepository {

    void save(AdminAuditLog log);

    Page<AdminAuditLog> findAll(Pageable pageable);
}
