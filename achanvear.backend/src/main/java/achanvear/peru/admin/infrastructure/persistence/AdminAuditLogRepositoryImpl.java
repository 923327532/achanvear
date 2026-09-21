package achanvear.peru.admin.infrastructure.persistence;

import achanvear.peru.admin.domain.model.AdminAuditLog;
import achanvear.peru.admin.domain.model.AuditAction;
import achanvear.peru.admin.domain.repository.AdminAuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public class AdminAuditLogRepositoryImpl implements AdminAuditLogRepository {

    private final AdminAuditLogJpaRepository jpaRepository;

    public AdminAuditLogRepositoryImpl(AdminAuditLogJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public void save(AdminAuditLog log) {
        AdminAuditLogJpaEntity entity = new AdminAuditLogJpaEntity();
        entity.setId(UUID.fromString(log.getId()));
        entity.setAdminUserId(UUID.fromString(log.getAdminUserId()));
        entity.setAction(log.getAction().name());
        entity.setResourceType(log.getResourceType());
        entity.setResourceId(log.getResourceId());
        entity.setMetadata(log.getMetadata());
        entity.setCreatedAt(log.getCreatedAt());
        jpaRepository.save(entity);
    }

    @Override
    public Page<AdminAuditLog> findAll(Pageable pageable) {
        return jpaRepository.findAll(pageable).map(entity -> AdminAuditLog.restore(
                entity.getId().toString(),
                entity.getAdminUserId().toString(),
                AuditAction.valueOf(entity.getAction()),
                entity.getResourceType(),
                entity.getResourceId(),
                entity.getMetadata(),
                entity.getCreatedAt()
        ));
    }
}
