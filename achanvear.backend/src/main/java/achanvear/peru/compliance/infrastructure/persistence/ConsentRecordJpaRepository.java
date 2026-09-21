package achanvear.peru.compliance.infrastructure.persistence;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConsentRecordJpaRepository extends JpaRepository<ConsentRecordJpaEntity, UUID> {

    List<ConsentRecordJpaEntity> findByUserIdOrderByAcceptedAtDesc(UUID userId);

    List<ConsentRecordJpaEntity> findByInterviewIdOrderByAcceptedAtDesc(String interviewId);

    Optional<ConsentRecordJpaEntity> findTopByInterviewIdAndConsentTypeAndAcceptedTrueOrderByAcceptedAtDesc(
            String interviewId, String consentType);

    Optional<ConsentRecordJpaEntity> findTopByUserIdAndConsentTypeAndAcceptedTrueOrderByAcceptedAtDesc(
            UUID userId, String consentType);

    @Query("""
            SELECT c FROM ConsentRecordJpaEntity c
            WHERE (:type IS NULL OR c.consentType = :type)
              AND (:userId IS NULL OR c.userId = :userId)
              AND (:status IS NULL OR (:status = 'ACCEPTED' AND c.accepted = true)
                    OR (:status = 'WITHDRAWN' AND (c.accepted = false OR c.withdrawnAt IS NOT NULL)))
            ORDER BY c.acceptedAt DESC
            """)
    Page<ConsentRecordJpaEntity> search(@Param("type") String type,
                                        @Param("userId") UUID userId,
                                        @Param("status") String status,
                                        Pageable pageable);
}
