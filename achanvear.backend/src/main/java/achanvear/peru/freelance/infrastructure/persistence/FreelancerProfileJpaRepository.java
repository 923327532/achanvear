package achanvear.peru.freelance.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface FreelancerProfileJpaRepository extends JpaRepository<FreelancerProfileJpaEntity, UUID> {

    Optional<FreelancerProfileJpaEntity> findByUserId(UUID userId);

    boolean existsByDni(String dni);

    java.util.List<Summary> findByUserIdIn(java.util.Collection<UUID> userIds);

    interface Summary {
        UUID getUserId();
        String getName();
        String getProfilePhotoUrl();
    }
}
