package achanvear.peru.identity.infrastructure.persistence;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserJpaRepository extends JpaRepository<UserJpaEntity, UUID> {

    Optional<UserJpaEntity> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByDni(String dni);

    @Query("""
            SELECT u FROM UserJpaEntity u
            WHERE (:pattern IS NULL OR LOWER(u.email) LIKE :pattern
                   OR LOWER(COALESCE(u.fullName, '')) LIKE :pattern)
              AND (:role IS NULL OR u.role = :role)
              AND (:status IS NULL OR u.status = :status)
            ORDER BY u.createdAt DESC
            """)
    Page<UserJpaEntity> searchUsers(@Param("pattern") String pattern,
                                    @Param("role") String role,
                                    @Param("status") String status,
                                    Pageable pageable);

    long countByRole(String role);

    long countByStatus(String status);

    @Query("SELECT COUNT(u) FROM UserJpaEntity u WHERE u.createdAt >= :from AND u.createdAt < :to")
    long countCreatedBetween(@Param("from") Instant from, @Param("to") Instant to);

    @Query("SELECT COUNT(u) FROM UserJpaEntity u WHERE u.status = 'ACTIVE' AND u.createdAt >= :from AND u.createdAt < :to")
    long countActiveCreatedBetween(@Param("from") Instant from, @Param("to") Instant to);

    @Query(value = "SELECT TO_CHAR(date_trunc(:granularity, created_at), 'YYYY-MM-DD') AS period, COUNT(*) AS total " +
            "FROM users WHERE created_at >= :from AND created_at < :to " +
            "GROUP BY 1 ORDER BY 1", nativeQuery = true)
    List<Object[]> countUsersPerPeriod(@Param("granularity") String granularity,
                                       @Param("from") Instant from,
                                       @Param("to") Instant to);
}
