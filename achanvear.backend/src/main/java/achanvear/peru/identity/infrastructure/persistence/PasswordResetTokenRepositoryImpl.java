package achanvear.peru.identity.infrastructure.persistence;

import achanvear.peru.identity.domain.model.PasswordResetToken;
import achanvear.peru.identity.domain.model.UserId;
import achanvear.peru.identity.domain.repository.PasswordResetTokenRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

/**
 * Implementation of PasswordResetTokenRepository using JPA.
 */
@Component
public class PasswordResetTokenRepositoryImpl implements PasswordResetTokenRepository {

    private final PasswordResetTokenJpaRepository jpaRepository;

    public PasswordResetTokenRepositoryImpl(PasswordResetTokenJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    @Transactional
    public PasswordResetToken save(PasswordResetToken token) {
        PasswordResetTokenJpaEntity entity = toEntity(token);
        PasswordResetTokenJpaEntity saved = jpaRepository.save(entity);
        return toDomain(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<PasswordResetToken> findByToken(String token) {
        return jpaRepository.findByToken(token).map(this::toDomain);
    }

    @Override
    @Transactional
    public void deleteByUserId(UserId userId) {
        jpaRepository.deleteByUserId(UUID.fromString(userId.toString()));
    }

    @Override
    @Transactional
    public void deleteExpiredTokens() {
        jpaRepository.deleteExpiredOrUsedTokens(Instant.now());
    }

    private PasswordResetTokenJpaEntity toEntity(PasswordResetToken token) {
        PasswordResetTokenJpaEntity entity = new PasswordResetTokenJpaEntity();
        entity.setToken(token.getToken());
        entity.setUserId(UUID.fromString(token.getUserId().toString()));
        entity.setExpiresAt(token.getExpiresAt());
        entity.setUsed(token.isUsed());
        entity.setCreatedAt(Instant.now());
        return entity;
    }

    private PasswordResetToken toDomain(PasswordResetTokenJpaEntity entity) {
        return PasswordResetToken.restore(
                entity.getToken(),
                UserId.from(entity.getUserId().toString()),
                entity.getExpiresAt(),
                entity.isUsed()
        );
    }
}
