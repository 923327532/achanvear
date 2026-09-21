package achanvear.peru.company.infrastructure.persistence;

import achanvear.peru.company.domain.model.CompanyCollaborator;
import achanvear.peru.company.domain.repository.CompanyCollaboratorRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class CompanyCollaboratorRepositoryImpl implements CompanyCollaboratorRepository {

    private final CompanyCollaboratorJpaRepository jpaRepository;
    private final CompanyCollaboratorMapper mapper;

    public CompanyCollaboratorRepositoryImpl(
            CompanyCollaboratorJpaRepository jpaRepository,
            CompanyCollaboratorMapper mapper
    ) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public void save(CompanyCollaborator collaborator) {
        jpaRepository.save(mapper.toEntity(collaborator));
    }

    @Override
    public Optional<CompanyCollaborator> findById(UUID id) {
        return jpaRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<CompanyCollaborator> findByCompanyId(UUID companyId) {
        return jpaRepository.findByCompanyId(companyId).stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public Optional<CompanyCollaborator> findByUserId(UUID userId) {
        return jpaRepository.findByUserId(userId).map(mapper::toDomain);
    }

    @Override
    public Optional<CompanyCollaborator> findByCompanyIdAndUserId(UUID companyId, UUID userId) {
        return jpaRepository.findByCompanyIdAndUserId(companyId, userId).map(mapper::toDomain);
    }

    @Override
    public long countByCompanyId(UUID companyId) {
        return jpaRepository.countByCompanyId(companyId);
    }

    @Override
    public boolean existsByEmail(String email) {
        return jpaRepository.existsByEmail(email);
    }

    @Override
    public void delete(CompanyCollaborator collaborator) {
        jpaRepository.deleteById(collaborator.getId());
    }
}
