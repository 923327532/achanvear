package achanvear.peru.company.infrastructure.persistence;

import org.springframework.data.jpa.domain.Specification;

public final class CompanySpecifications {

    private CompanySpecifications() {
    }

    public static Specification<CompanyJpaEntity> containsSearch(String search) {
        return (root, query, criteriaBuilder) -> {
            if (search == null || search.trim().isBlank()) {
                return null;
            }

            String pattern = "%" + search.trim().toLowerCase() + "%";

            return criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("businessName")), pattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("legalName")), pattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("industry")), pattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("specialty")), pattern)
            );
        };
    }

    public static Specification<CompanyJpaEntity> hasStatus(String status) {
        return (root, query, criteriaBuilder) -> {
            if (status == null || status.trim().isBlank()) {
                return null;
            }
            return criteriaBuilder.equal(root.get("status"), status.trim().toUpperCase());
        };
    }

    public static Specification<CompanyJpaEntity> hasIndustry(String industry) {
        return (root, query, criteriaBuilder) -> {
            if (industry == null || industry.trim().isBlank()) {
                return null;
            }
            return criteriaBuilder.equal(criteriaBuilder.lower(root.get("industry")), industry.trim().toLowerCase());
        };
    }

    public static Specification<CompanyJpaEntity> hasCompanySize(String companySize) {
        return (root, query, criteriaBuilder) -> {
            if (companySize == null || companySize.trim().isBlank()) {
                return null;
            }
            return criteriaBuilder.equal(root.get("companySize"), companySize.trim().toUpperCase());
        };
    }

    public static Specification<CompanyJpaEntity> hasCompanyPlan(String companyPlan) {
        return (root, query, criteriaBuilder) -> {
            if (companyPlan == null || companyPlan.trim().isBlank()) {
                return null;
            }
            return criteriaBuilder.equal(root.get("companyPlan"), companyPlan.trim().toUpperCase());
        };
    }
}