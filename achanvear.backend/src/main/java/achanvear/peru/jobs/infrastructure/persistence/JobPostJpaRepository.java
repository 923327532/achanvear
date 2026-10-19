package achanvear.peru.jobs.infrastructure.persistence;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.Instant;
import java.util.UUID;
import java.util.Optional;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;

public interface JobPostJpaRepository extends
        JpaRepository<JobPostJpaEntity, UUID>,
        JpaSpecificationExecutor<JobPostJpaEntity> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select j from JobPostJpaEntity j where j.id = :id")
    Optional<JobPostJpaEntity> findLockedById(@Param("id") UUID id);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = """
            update job_posts j set status = 'CLOSED', updated_at = CURRENT_TIMESTAMP
            where j.status = 'PUBLISHED' and (
                (j.selection_mode = 'FIXED_DATE' and j.closing_date <= CURRENT_TIMESTAMP)
                or (j.selection_mode = 'MAX_APPLICANTS' and j.max_applicants > 0
                    and (select count(*) from job_applications a where a.job_post_id = j.id) >= j.max_applicants)
            )
            """, nativeQuery = true)
    int closeExpiredJobs();

    boolean existsByTitleIgnoreCaseAndCompanyId(String title, UUID companyId);

    long countByCompanyIdAndStatus(UUID companyId, String status);

    long countByCompanyIdAndCreatedAtGreaterThanEqual(UUID companyId, Instant createdAt);

    Page<JobPostJpaEntity> findByCompanyId(UUID companyId, Pageable pageable);
}
