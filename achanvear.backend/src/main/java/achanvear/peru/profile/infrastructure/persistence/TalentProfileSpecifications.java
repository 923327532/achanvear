package achanvear.peru.profile.infrastructure.persistence;

import achanvear.peru.profile.ProfileType;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

public final class TalentProfileSpecifications {

    private TalentProfileSpecifications() {
    }

    public static Specification<TalentProfileJpaEntity> withFilters(
            String search,
            String profileType,
            String skill
    ) {
        return Specification.where(bySearch(search))
                .and(byProfileType(profileType))
                .and(bySkill(skill));
    }

    public static Specification<TalentProfileJpaEntity> bySearch(String search) {
        return (root, query, criteriaBuilder) -> {
            if (search == null || search.isBlank()) {
                return criteriaBuilder.conjunction();
            }

            String pattern = "%" + search.trim().toLowerCase() + "%";

            return criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("headline")), pattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("biography")), pattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("location")), pattern)
            );
        };
    }

    public static Specification<TalentProfileJpaEntity> byProfileType(String profileType) {
        return (root, query, criteriaBuilder) -> {
            if (profileType == null || profileType.isBlank()) {
                return criteriaBuilder.conjunction();
            }

            return criteriaBuilder.equal(
                    root.get("profileType"),
                    ProfileType.valueOf(profileType.trim().toUpperCase())
            );
        };
    }

    public static Specification<TalentProfileJpaEntity> bySkill(String skill) {
        return (root, query, criteriaBuilder) -> {
            if (skill == null || skill.isBlank()) {
                return criteriaBuilder.conjunction();
            }

            query.distinct(true);

            var skillJoin = root.join("skills", JoinType.LEFT);
            return criteriaBuilder.like(
                    criteriaBuilder.lower(skillJoin.get("name")),
                    "%" + skill.trim().toLowerCase() + "%"
            );
        };
    }
}
