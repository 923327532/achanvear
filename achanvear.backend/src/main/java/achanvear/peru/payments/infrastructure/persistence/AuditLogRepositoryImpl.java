package achanvear.peru.payments.infrastructure.persistence;

import achanvear.peru.payments.domain.model.AuditLog;
import achanvear.peru.payments.domain.model.AuditLogId;
import achanvear.peru.payments.domain.repository.AuditLogRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
public class AuditLogRepositoryImpl implements AuditLogRepository {

    private final AuditLogJpaRepository jpaRepository;
    private final AuditLogMapper mapper;

    public AuditLogRepositoryImpl(AuditLogJpaRepository jpaRepository, AuditLogMapper mapper) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public void save(AuditLog auditLog) {
        jpaRepository.save(mapper.toEntity(auditLog));
    }

    @Override
    public List<AuditLog> findByUserId(UUID userId) {
        return jpaRepository.findByUserId(userId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<AuditLog> findByAction(String action) {
        return jpaRepository.findByAction(action).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<AuditLog> findByEntityTypeAndEntityId(String entityType, String entityId) {
        return jpaRepository.findByEntityTypeAndEntityId(entityType, entityId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<AuditLog> findByDateRange(Instant from, Instant to) {
        return jpaRepository.findByCreatedAtBetween(from, to).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
}
