package achanvear.peru.identity.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA repository for password reset tokens.
 */
@Repository
public interface PasswordResetTokenJpaRepository extends JpaRepository<PasswordResetTokenJpaEntity, String> {

    Optional<PasswordResetTokenJpaEntity> findByToken(String token);

    void deleteByUserId(UUID userId);

    @Modifying
    @Query("DELETE FROM PasswordResetTokenJpaEntity t WHERE t.expiresAt < :now OR t.used = true")
    void deleteExpiredOrUsedTokens(Instant now);
}
