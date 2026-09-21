package achanvear.peru.company.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CompanyCollaboratorJpaRepository extends JpaRepository<CompanyCollaboratorJpaEntity, UUID> {

    List<CompanyCollaboratorJpaEntity> findByCompanyId(UUID companyId);

    Optional<CompanyCollaboratorJpaEntity> findByUserId(UUID userId);

    Optional<CompanyCollaboratorJpaEntity> findByCompanyIdAndUserId(UUID companyId, UUID userId);

    long countByCompanyId(UUID companyId);

    boolean existsByEmail(String email);
}
