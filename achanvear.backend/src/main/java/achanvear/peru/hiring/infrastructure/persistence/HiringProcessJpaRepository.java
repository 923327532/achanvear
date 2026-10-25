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
    @Query(value = """
            SELECT COUNT(*) FROM hiring_processes p JOIN job_posts j ON CAST(j.id AS VARCHAR) = p.job_id
            JOIN job_applications a ON a.job_post_id = j.id AND CAST(a.candidate_user_id AS VARCHAR) = p.candidate_id
            WHERE j.company_id = :companyId AND p.stage = :stage AND a.status <> 'REJECTED'
            """, nativeQuery = true)
    long countByCompanyAndStage(@Param("companyId") UUID companyId, @Param("stage") String stage);
}