package achanvear.peru.identity.domain.repository;

import achanvear.peru.identity.domain.model.PasswordResetToken;
import achanvear.peru.identity.domain.model.UserId;

import java.util.Optional;

/**
 * Repository interface for password reset tokens.
 */
public interface PasswordResetTokenRepository {

    PasswordResetToken save(PasswordResetToken token);

    Optional<PasswordResetToken> findByToken(String token);

    void deleteByUserId(UserId userId);

    void deleteExpiredTokens();
}
