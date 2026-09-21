package achanvear.peru.identity.infrastructure.persistence;

import achanvear.peru.identity.application.port.in.UserQueryPort;
import achanvear.peru.identity.application.query.AdminUserQuery;
import achanvear.peru.identity.application.query.UserPeriodBucket;
import achanvear.peru.identity.domain.model.User;
import achanvear.peru.identity.domain.model.UserRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Component
public class UserQueryPortImpl implements UserQueryPort {

    private final UserJpaRepository userJpaRepository;
    private final UserMapper userMapper;

    public UserQueryPortImpl(UserJpaRepository userJpaRepository, UserMapper userMapper) {
        this.userJpaRepository = userJpaRepository;
        this.userMapper = userMapper;
    }

    @Override
    public Page<User> findAll(AdminUserQuery query) {
        int page = Math.max(query.page(), 0);
        int size = Math.min(Math.max(query.size(), 1), 100);
        String search = normalize(query.search());
        String pattern = search != null ? "%" + search.toLowerCase() + "%" : null;
        return userJpaRepository.searchUsers(
                        pattern,
                        query.role(),
                        query.status(),
                        PageRequest.of(page, size))
                .map(userMapper::toDomain);
    }

    @Override
    public long count() {
        return userJpaRepository.count();
    }

    @Override
    public long countByRole(UserRole role) {
        return userJpaRepository.countByRole(role.name());
    }

    @Override
    public long countActive() {
        return userJpaRepository.countByStatus("ACTIVE");
    }

    @Override
    public long countByStatus(String status) {
        return userJpaRepository.countByStatus(status);
    }

    @Override
    public long countCreatedBetween(Instant from, Instant to) {
        return userJpaRepository.countCreatedBetween(from, to);
    }

    @Override
    public long countActiveCreatedBetween(Instant from, Instant to) {
        return userJpaRepository.countActiveCreatedBetween(from, to);
    }

    @Override
    public List<UserPeriodBucket> countSeries(Instant from, Instant to, String granularity) {
        return userJpaRepository.countUsersPerPeriod(granularity, from, to).stream()
                .map(row -> new UserPeriodBucket((String) row[0], ((Number) row[1]).longValue()))
                .toList();
    }

    @Override
    public Optional<User> findById(UUID id) {
        return userJpaRepository.findById(id).map(userMapper::toDomain);
    }

    private String normalize(String value) {
        return value != null && value.isBlank() ? null : value;
    }
}
