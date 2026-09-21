package achanvear.peru.identity.infrastructure.persistence;

import achanvear.peru.identity.domain.model.Email;
import achanvear.peru.identity.domain.model.User;
import achanvear.peru.identity.domain.model.UserId;
import achanvear.peru.identity.domain.repository.UserRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

@Repository
public class UserRepositoryImpl implements UserRepository {

    private final UserJpaRepository userJpaRepository;
    private final UserMapper userMapper;

    public UserRepositoryImpl(
            UserJpaRepository userJpaRepository,
            UserMapper userMapper
    ) {
        this.userJpaRepository = userJpaRepository;
        this.userMapper = userMapper;
    }

    @Override
    public void save(User user) {
        Optional<UserJpaEntity> existingUser = userJpaRepository.findById(user.getId().value());

        UserJpaEntity entity = existingUser.orElseGet(UserJpaEntity::new);
        entity.setId(user.getId().value());
        entity.setEmail(user.getEmail().value());
        entity.setFullName(user.getFullName());
        entity.setDni(user.getDni());
        entity.setPhone(user.getPhone());
        entity.setPasswordHash(user.getPasswordHash());
        entity.setRole(user.getRole().name());
        entity.setStatus(user.getStatus().name());

        Instant now = Instant.now();
        if (entity.getCreatedAt() == null) {
            entity.setCreatedAt(now);
        }
        entity.setUpdatedAt(now);

        userJpaRepository.save(entity);
    }

    @Override
    public Optional<User> findById(UserId userId) {
        return userJpaRepository.findById(userId.value())
                .map(userMapper::toDomain);
    }

    @Override
    public Optional<User> findByEmail(Email email) {
        return userJpaRepository.findByEmail(email.value())
                .map(userMapper::toDomain);
    }

    @Override
    public boolean existsByEmail(Email email) {
        return userJpaRepository.existsByEmail(email.value());
    }

    @Override
    public boolean existsByDni(String dni) {
        return userJpaRepository.existsByDni(dni);
    }

    @Override
    public boolean existsById(UserId userId) {
        return userJpaRepository.existsById(userId.value());
    }
}
