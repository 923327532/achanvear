package achanvear.peru.jobs.infrastructure.persistence;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.Instant;
import java.util.UUID;

public interface JobPostJpaRepository extends
        JpaRepository<JobPostJpaEntity, UUID>,
        JpaSpecificationExecutor<JobPostJpaEntity> {

    boolean existsByTitleIgnoreCaseAndCompanyId(String title, UUID companyId);

    long countByCompanyIdAndStatus(UUID companyId, String status);

    long countByCompanyIdAndCreatedAtGreaterThanEqual(UUID companyId, Instant createdAt);

    Page<JobPostJpaEntity> findByCompanyId(UUID companyId, Pageable pageable);
}
