package achanvear.peru.identity.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface User2faJpaRepository extends JpaRepository<User2faJpaEntity, UUID> {
    Optional<User2faJpaEntity> findByUserId(UUID userId);
}