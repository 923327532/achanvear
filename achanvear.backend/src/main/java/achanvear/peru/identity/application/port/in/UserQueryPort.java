package achanvear.peru.identity.application.port.in;

import achanvear.peru.identity.application.query.AdminUserQuery;
import achanvear.peru.identity.application.query.UserPeriodBucket;
import achanvear.peru.identity.domain.model.User;
import achanvear.peru.identity.domain.model.UserRole;
import org.springframework.data.domain.Page;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Puerto de consulta de usuarios para el panel administrativo.
 * El módulo admin depende de esta interfaz, nunca de repositorios de identity.
 */
public interface UserQueryPort {

    Page<User> findAll(AdminUserQuery query);

    long count();

    long countByRole(UserRole role);

    long countActive();

    long countByStatus(String status);

    long countCreatedBetween(Instant from, Instant to);

    long countActiveCreatedBetween(Instant from, Instant to);

    List<UserPeriodBucket> countSeries(Instant from, Instant to, String granularity);

    Optional<User> findById(UUID id);
}
