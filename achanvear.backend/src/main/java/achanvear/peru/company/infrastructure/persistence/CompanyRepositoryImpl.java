package achanvear.peru.company.infrastructure.persistence;

import achanvear.peru.company.application.query.CompanyListQuery;
import achanvear.peru.company.domain.model.Company;
import achanvear.peru.company.domain.model.CompanyId;
import achanvear.peru.company.domain.repository.CompanyRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public class CompanyRepositoryImpl implements CompanyRepository {

    private static final String DEFAULT_SORT_BY = "createdAt";

    private final CompanyJpaRepository companyJpaRepository;
    private final CompanyMapper companyMapper;

    public CompanyRepositoryImpl(
            CompanyJpaRepository companyJpaRepository,
            CompanyMapper companyMapper
    ) {
        this.companyJpaRepository = companyJpaRepository;
        this.companyMapper = companyMapper;
    }

    @Override
    public void save(Company company) {
        companyJpaRepository.save(companyMapper.toEntity(company));
    }

    @Override
    public Optional<Company> findById(CompanyId companyId) {
        return companyJpaRepository.findById(companyId.value()).map(companyMapper::toDomain);
    }

    @Override
    public Optional<Company> findByOwnerUserId(UUID ownerUserId) {
        return companyJpaRepository.findByOwnerUserId(ownerUserId).map(companyMapper::toDomain);
    }

    @Override
    public boolean existsByOwnerUserId(UUID ownerUserId) {
        return companyJpaRepository.existsByOwnerUserId(ownerUserId);
    }

    @Override
    public boolean existsByBusinessName(String businessName) {
        return companyJpaRepository.existsByBusinessNameIgnoreCase(businessName);
    }

    @Override
    public Page<Company> search(CompanyListQuery query) {
        Sort.Direction direction = resolveDirection(query.sortDirection());
        String sortBy = resolveSortBy(query.sortBy());

        PageRequest pageable = PageRequest.of(
                Math.max(query.page(), 0),
                resolvePageSize(query.size()),
                Sort.by(direction, sortBy)
        );

        Specification<CompanyJpaEntity> specification = Specification
                .where(CompanySpecifications.containsSearch(query.search()))
                .and(CompanySpecifications.hasStatus(query.status()))
                .and(CompanySpecifications.hasIndustry(query.industry()))
                .and(CompanySpecifications.hasCompanySize(query.companySize()))
                .and(CompanySpecifications.hasCompanyPlan(query.companyPlan()));

        return companyJpaRepository.findAll(specification, pageable).map(companyMapper::toDomain);
    }

    private Sort.Direction resolveDirection(String sortDirection) {
        return "DESC".equalsIgnoreCase(sortDirection) ? Sort.Direction.DESC : Sort.Direction.ASC;
    }

    private String resolveSortBy(String sortBy) {
        if (sortBy == null || sortBy.trim().isBlank()) {
            return DEFAULT_SORT_BY;
        }

        return switch (sortBy.trim()) {
            case "businessName", "legalName", "industry", "companyPlan", "status", "createdAt", "updatedAt" -> sortBy.trim();
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