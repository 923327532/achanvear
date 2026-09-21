package achanvear.peru.payments.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CreditPackageRepository extends JpaRepository<CreditPackageJpaEntity, String> {

    @Query("SELECT p FROM CreditPackageJpaEntity p WHERE p.isActive = true ORDER BY p.sortOrder ASC")
    List<CreditPackageJpaEntity> findAllActiveOrdered();
}
