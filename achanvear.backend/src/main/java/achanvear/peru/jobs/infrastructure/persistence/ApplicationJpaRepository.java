package achanvear.peru.jobs.infrastructure.persistence;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;
import java.util.List;

public interface ApplicationJpaRepository extends JpaRepository<JobApplicationJpaEntity, UUID> {

    Page<JobApplicationJpaEntity> findByCandidateUserId(UUID candidateUserId, Pageable pageable);

    List<JobApplicationJpaEntity> findByCandidateUserId(UUID candidateUserId);


    Page<JobApplicationJpaEntity> findByJobPostId(UUID jobPostId, Pageable pageable);

    @Query("""
            SELECT COUNT(application)
            FROM JobApplicationJpaEntity application
            WHERE application.jobPost.companyId = :companyId
            """)
    long countByCompanyId(@Param("companyId") UUID companyId);

    @Query("""
            SELECT COUNT(DISTINCT application.candidateUserId)
            FROM JobApplicationJpaEntity application
            WHERE application.jobPost.companyId = :companyId
              AND application.status = :status
            """)
    long countDistinctCandidatesByCompanyIdAndStatus(
            @Param("companyId") UUID companyId,
            @Param("status") String status
    );
}