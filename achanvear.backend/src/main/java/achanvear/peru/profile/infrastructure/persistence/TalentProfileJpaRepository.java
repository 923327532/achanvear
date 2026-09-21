package achanvear.peru.profile.infrastructure.persistence;

import achanvear.peru.profile.ProfileType;
import achanvear.peru.profile.domain.model.ProfileStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface TalentProfileJpaRepository 
        extends JpaRepository<TalentProfileJpaEntity, UUID>, JpaSpecificationExecutor<TalentProfileJpaEntity> {

    Optional<TalentProfileJpaEntity> findByUserId(UUID userId);

    Page<TalentProfileJpaEntity> findByProfileType(ProfileType profileType, Pageable pageable);

    Page<TalentProfileJpaEntity> findByStatus(ProfileStatus status, Pageable pageable);
}