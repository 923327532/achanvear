package achanvear.peru.interview.infrastructure.persistence.repository;

import achanvear.peru.interview.infrastructure.persistence.entity.InterviewJpaEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewJpaRepository extends JpaRepository<InterviewJpaEntity, String> {
    
    Optional<InterviewJpaEntity> findByHiringProcessId(String hiringProcessId);
    
    List<InterviewJpaEntity> findByCandidateId(String candidateId);
    
    Optional<InterviewJpaEntity> findDetailedById(String id);

    long countByStatus(String status);

    long countByInterviewType(String interviewType);

    @Query("""
            SELECT i FROM InterviewJpaEntity i
            WHERE (:status IS NULL OR i.status = :status)
              AND (:type IS NULL OR i.interviewType = :type)
            ORDER BY i.createdAt DESC
            """)
    Page<InterviewJpaEntity> searchInterviews(@Param("status") String status,
                                              @Param("type") String type,
                                              Pageable pageable);

    @Query("SELECT COUNT(i) FROM InterviewJpaEntity i WHERE i.score >= 60")
    long countApproved();

    @Query("SELECT COUNT(i) FROM InterviewJpaEntity i WHERE i.score IS NOT NULL AND i.score < 60")
    long countRejected();

    @Query("SELECT COUNT(i) FROM InterviewJpaEntity i WHERE i.pythonSessionId IS NOT NULL")
    long countWithPythonSession();

    @Query("SELECT COUNT(v) FROM InterviewViolationJpaEntity v")
    long countTotalViolations();
}
