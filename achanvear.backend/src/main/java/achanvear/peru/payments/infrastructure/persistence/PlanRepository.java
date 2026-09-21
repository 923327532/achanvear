package achanvear.peru.payments.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlanRepository extends JpaRepository<PlanJpaEntity, String> {

    @Query("SELECT p FROM PlanJpaEntity p WHERE p.isActive = true ORDER BY p.sortOrder ASC")
    List<PlanJpaEntity> findAllActiveOrdered();

    @Query("SELECT b FROM PlanBenefitJpaEntity b WHERE b.planId = :planId ORDER BY b.sortOrder ASC")
    List<PlanBenefitJpaEntity> findBenefitsByPlanId(String planId);
}
