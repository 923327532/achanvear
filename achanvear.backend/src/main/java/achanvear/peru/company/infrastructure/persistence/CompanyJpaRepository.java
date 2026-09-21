package achanvear.peru.company.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CompanyJpaRepository extends
        JpaRepository<CompanyJpaEntity, UUID>,
        JpaSpecificationExecutor<CompanyJpaEntity> {

    Optional<CompanyJpaEntity> findByOwnerUserId(UUID ownerUserId);

    boolean existsByOwnerUserId(UUID ownerUserId);

    boolean existsByBusinessNameIgnoreCase(String businessName);

    @Query(value = """
            SELECT fp.id::text AS id, 'PROJECT' AS type, fp.title, fp.description, 
                   fp.created_at::text AS date, fp.status, fp.id::text AS related_id,
                   NULL AS freelancer_name, NULL::numeric AS amount
            FROM freelance_projects fp
            WHERE fp.client_user_id = :ownerUserId
            UNION ALL
            SELECT fp.id::text AS id, 'PROPOSAL' AS type, fp.title, fpp.cover_letter,
                   fpp.submitted_at::text AS date, fpp.status, fpp.id::text AS related_id,
                   u.full_name AS freelancer_name, fpp.proposed_budget AS amount
            FROM freelance_proposals fpp
            JOIN freelance_projects fp ON fp.id = fpp.project_id
            LEFT JOIN users u ON u.id = fpp.freelancer_user_id
            WHERE fp.client_user_id = :ownerUserId
            UNION ALL
            SELECT p.id::text AS id, 'PAYMENT' AS type, 
                   COALESCE(fp.title, 'Pago') AS title, 'Pago realizado' AS description,
                   p.created_at::text AS date, p.status, p.id::text AS related_id,
                   u.full_name AS freelancer_name, p.amount
            FROM payments p
            LEFT JOIN freelance_projects fp ON fp.id = p.project_id
            LEFT JOIN users u ON u.id = p.freelancer_user_id
            WHERE p.client_user_id = :ownerUserId
            ORDER BY date DESC
            """, nativeQuery = true)
    List<Object[]> findCompanyHistoryByOwnerUserId(@Param("ownerUserId") UUID ownerUserId);
}
