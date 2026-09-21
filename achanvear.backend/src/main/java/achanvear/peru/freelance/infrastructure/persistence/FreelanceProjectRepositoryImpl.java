package achanvear.peru.freelance.infrastructure.persistence;

import achanvear.peru.freelance.application.query.FreelanceProjectSearchQuery;
import achanvear.peru.freelance.domain.model.FreelanceProject;
import achanvear.peru.freelance.domain.model.FreelanceProjectId;
import achanvear.peru.freelance.domain.model.ProjectStatus;
import achanvear.peru.freelance.domain.repository.FreelanceProjectRepository;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public class FreelanceProjectRepositoryImpl implements FreelanceProjectRepository {

    private final FreelanceProjectJpaRepository jpaRepository;
    private final FreelancePersistenceMapper mapper;

    public FreelanceProjectRepositoryImpl(
            FreelanceProjectJpaRepository jpaRepository,
            FreelancePersistenceMapper mapper
    ) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public void save(FreelanceProject freelanceProject) {
        jpaRepository.save(mapper.toEntity(freelanceProject));
    }

    @Override
    public Optional<FreelanceProject> findById(FreelanceProjectId id) {
        return jpaRepository.findById(id.value()).map(mapper::toFreelanceProjectDomain);
    }

    @Override
    public Page<FreelanceProject> search(FreelanceProjectSearchQuery query) {
        Pageable pageable = PageRequest.of(
                Math.max(query.page(), 0),
                Math.min(Math.max(query.size(), 1), 100),
                Sort.by(resolveDirection(query.sortDirection()), resolveSortBy(query.sortBy()))
        );

        Specification<FreelanceProjectJpaEntity> specification = (root, cq, cb) -> {
            // Evitar DISTINCT duplicado si ya se agregó por el fetch
            if (Long.class != cq.getResultType()) {
                root.fetch("proposals", JoinType.LEFT);
            }

            List<Predicate> predicates = new ArrayList<>();

            if (query.search() != null && !query.search().isBlank()) {
                String pattern = "%" + query.search().trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern),
                        cb.like(cb.lower(root.get("category")), pattern)
                ));
            }

            if (query.category() != null && !query.category().isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("category")), query.category().trim().toLowerCase()));
            }

            if (query.status() != null && !query.status().isBlank()) {
                predicates.add(cb.equal(root.get("status"), ProjectStatus.valueOf(query.status().trim().toUpperCase())));
            }

            if (query.clientUserId() != null && !query.clientUserId().isBlank()) {
                predicates.add(cb.equal(root.get("clientUserId"), UUID.fromString(query.clientUserId())));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return jpaRepository.findAll(specification, pageable).map(mapper::toFreelanceProjectDomain);

    }

    @Override
    public Optional<FreelanceProject> findById(String projectId) {
        return Optional.empty();
    }

    @Override
    public List<FreelanceProject> findByClientId(UUID clientId) {
        return List.of();
    }

    @Override
    public List<FreelanceProject> findByFreelancerId(UUID freelancerId) {
        return List.of();
    }

    @Override
    public List<FreelanceProject> findAll() {
        return List.of();
    }

    @Override
    public Page<FreelanceProject> findProjectsByFreelancerProposals(UUID freelancerUserId, Pageable pageable) {
        return jpaRepository.findProjectsByFreelancerProposals(freelancerUserId, pageable)
                .map(mapper::toFreelanceProjectDomain);
    }

    private Sort.Direction resolveDirection(String value) {
        if (value == null || value.isBlank()) {
            return Sort.Direction.DESC;
        }

        return "ASC".equalsIgnoreCase(value) ? Sort.Direction.ASC : Sort.Direction.DESC;
    }

    private String resolveSortBy(String value) {
        if (value == null || value.isBlank()) {
            return "createdAt";
        }

        return switch (value) {
            case "title", "budget", "estimatedDays", "createdAt" -> value;
            default -> "createdAt";
        };
    }
}