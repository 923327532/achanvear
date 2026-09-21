package achanvear.peru.company.domain.repository;

import achanvear.peru.company.domain.model.CompanyCollaborator;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CompanyCollaboratorRepository {

    void save(CompanyCollaborator collaborator);

    Optional<CompanyCollaborator> findById(UUID id);

    List<CompanyCollaborator> findByCompanyId(UUID companyId);

    Optional<CompanyCollaborator> findByUserId(UUID userId);

    Optional<CompanyCollaborator> findByCompanyIdAndUserId(UUID companyId, UUID userId);

    long countByCompanyId(UUID companyId);

    boolean existsByEmail(String email);

    void delete(CompanyCollaborator collaborator);
}
