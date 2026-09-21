package achanvear.peru.services.infrastructure.persistence;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ServiceJpaRepository extends JpaRepository<ServiceJpaEntity, UUID> {

    List<ServiceJpaEntity> findByFreelancerUserIdAndStatusNotOrderByCreatedAtDesc(UUID freelancerUserId, String status);

    List<ServiceJpaEntity> findByFreelancerUserIdAndStatusOrderByCreatedAtDesc(UUID freelancerUserId, String status);

    @Query("SELECT s FROM ServiceJpaEntity s WHERE s.status = 'ACTIVE' " +
           "AND (:pattern IS NULL OR LOWER(s.title) LIKE :pattern OR LOWER(s.description) LIKE :pattern) " +
           "AND (:category IS NULL OR s.category = :category) " +
           "ORDER BY s.createdAt DESC")
    Page<ServiceJpaEntity> findActiveServices(
            @Param("pattern") String pattern,
            @Param("category") String category,
            Pageable pageable
    );

    long countByFreelancerUserIdAndStatus(UUID freelancerUserId, String status);

    @Query("SELECT COALESCE(SUM(s.sales), 0) FROM ServiceJpaEntity s WHERE s.freelancerUserId = :userId")
    long sumSalesByFreelancerUserId(@Param("userId") UUID userId);

    @Query("SELECT COALESCE(AVG(s.rating), 0) FROM ServiceJpaEntity s WHERE s.freelancerUserId = :userId")
    double avgRatingByFreelancerUserId(@Param("userId") UUID userId);

    @Query("SELECT COALESCE(SUM(s.views), 0) FROM ServiceJpaEntity s WHERE s.freelancerUserId = :userId")
    long sumViewsByFreelancerUserId(@Param("userId") UUID userId);
}
