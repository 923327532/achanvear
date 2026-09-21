package achanvear.peru.jobs.infrastructure.persistence;

import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public final class JobPostSpecifications {

    private JobPostSpecifications() {
    }

    public static Specification<JobPostJpaEntity> containsSearch(String search) {
        return (root, query, criteriaBuilder) -> {
            if (search == null || search.trim().isBlank()) {
                return null;
            }

            String pattern = "%" + search.trim().toLowerCase() + "%";

            return criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), pattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), pattern)
            );
        };
    }

    public static Specification<JobPostJpaEntity> hasLocation(String location) {
        return (root, query, criteriaBuilder) -> {
            if (location == null || location.trim().isBlank()) {
                return null;
            }
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("location")), "%" + location.trim().toLowerCase() + "%");
        };
    }

    public static Specification<JobPostJpaEntity> hasType(String type) {
        return (root, query, criteriaBuilder) -> {
            if (type == null || type.trim().isBlank()) {
                return null;
            }
            return criteriaBuilder.equal(root.get("type"), type.trim().toUpperCase());
        };
    }

    public static Specification<JobPostJpaEntity> hasStatus(String status) {
        return (root, query, criteriaBuilder) -> {
            if (status == null || status.trim().isBlank()) {
                return null;
            }
            return criteriaBuilder.equal(root.get("status"), status.trim().toUpperCase());
        };
    }

    public static Specification<JobPostJpaEntity> hasCompanyId(String companyId) {
        return (root, query, criteriaBuilder) -> {
            if (companyId == null || companyId.trim().isBlank()) {
                return null;
            }
            return criteriaBuilder.equal(root.get("companyId"), UUID.fromString(companyId.trim()));
        };
    }
}
