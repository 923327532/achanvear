package achanvear.peru.jobs.infrastructure.persistence;

import achanvear.peru.jobs.application.query.JobSearchQuery;
import achanvear.peru.jobs.domain.model.JobPost;
import achanvear.peru.jobs.domain.model.JobPostId;
import achanvear.peru.jobs.domain.repository.JobPostRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public class JobPostRepositoryImpl implements JobPostRepository {

    private static final String DEFAULT_SORT_BY = "createdAt";

    private final JobPostJpaRepository jobPostJpaRepository;
    private final JobPostMapper jobPostMapper;

    public JobPostRepositoryImpl(
            JobPostJpaRepository jobPostJpaRepository,
            JobPostMapper jobPostMapper
    ) {
        this.jobPostJpaRepository = jobPostJpaRepository;
        this.jobPostMapper = jobPostMapper;
    }

    @Override
    public void save(JobPost jobPost) {
        jobPostJpaRepository.save(jobPostMapper.toEntity(jobPost));
    }

    @Override
    public Optional<JobPost> findById(JobPostId id) {
        return jobPostJpaRepository.findById(id.value()).map(jobPostMapper::toDomain);
    }

    @Override
    public Page<JobPost> search(JobSearchQuery query) {
        Sort.Direction direction = resolveDirection(query.sortDirection());
        String sortBy = resolveSortBy(query.sortBy());

        PageRequest pageable = PageRequest.of(
                Math.max(query.page(), 0),
                resolvePageSize(query.size()),
                Sort.by(direction, sortBy)
        );

        Specification<JobPostJpaEntity> specification = Specification
                .where(JobPostSpecifications.containsSearch(query.search()))
                .and(JobPostSpecifications.hasLocation(query.location()))
                .and(JobPostSpecifications.hasType(query.type()))
                .and(JobPostSpecifications.hasStatus(query.status()))
                .and(JobPostSpecifications.hasCompanyId(query.companyId()));

        return jobPostJpaRepository.findAll(specification, pageable).map(jobPostMapper::toDomain);
    }

    @Override
    public boolean existsByTitleAndCompanyId(String title, UUID companyId) {
        return jobPostJpaRepository.existsByTitleIgnoreCaseAndCompanyId(title, companyId);
    }

    @Override
    public Page<JobPost> findByCompanyId(UUID companyId, Pageable pageable) {
        return jobPostJpaRepository.findByCompanyId(companyId, pageable)
                .map(jobPostMapper::toDomain);
    }

    @Override
    public void deleteById(JobPostId id) {
        jobPostJpaRepository.deleteById(id.value());
    }

    private Sort.Direction resolveDirection(String sortDirection) {
        return "DESC".equalsIgnoreCase(sortDirection) ? Sort.Direction.DESC : Sort.Direction.ASC;
    }

    private String resolveSortBy(String sortBy) {
        if (sortBy == null || sortBy.trim().isBlank()) {
            return DEFAULT_SORT_BY;
        }

        return switch (sortBy.trim()) {
            case "title", "location", "type", "status", "createdAt", "updatedAt" -> sortBy.trim();
            default -> DEFAULT_SORT_BY;
        };
    }

    private int resolvePageSize(int size) {
        if (size <= 0) {
            return 10;
        }

        return Math.min(size, 100);
    }
}
