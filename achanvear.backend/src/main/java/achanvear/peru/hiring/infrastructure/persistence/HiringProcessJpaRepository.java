package achanvear.peru.hiring.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface HiringProcessJpaRepository extends JpaRepository<HiringProcessJpaEntity, String> {

    Optional<HiringProcessJpaEntity> findByJobIdAndCandidateId(String jobId, String candidateId);

    @Query(value = """
            SELECT COUNT(DISTINCT process.candidate_id)
            FROM hiring_processes process
            JOIN job_posts job ON CAST(job.id AS VARCHAR) = process.job_id
            JOIN job_applications application
              ON application.job_post_id = job.id
             AND CAST(application.candidate_user_id AS VARCHAR) = process.candidate_id
            WHERE job.company_id = :companyId
              AND process.stage IN ('APPROVED', 'HIRED')
              AND application.status <> 'REJECTED'
            """, nativeQuery = true)
    long countFinalistsByCompanyId(@Param("companyId") UUID companyId);
}