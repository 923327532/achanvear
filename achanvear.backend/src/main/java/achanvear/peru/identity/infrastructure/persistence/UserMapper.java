package achanvear.peru.identity.infrastructure.persistence;

import achanvear.peru.identity.domain.model.Email;
import achanvear.peru.identity.domain.model.User;
import achanvear.peru.identity.domain.model.UserId;
import achanvear.peru.identity.domain.model.UserRole;
import achanvear.peru.identity.domain.model.UserStatus;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class UserMapper {

    public UserJpaEntity toEntity(User user) {
        UserJpaEntity entity = new UserJpaEntity();
        entity.setId(user.getId().value());
        entity.setEmail(user.getEmail().value());
        entity.setFullName(user.getFullName());
        entity.setDni(user.getDni());
        entity.setPhone(user.getPhone());
        entity.setPasswordHash(user.getPasswordHash());
        entity.setRole(user.getRole().name());
        entity.setStatus(user.getStatus().name());
        entity.setRepresentanteDni(user.getRepresentanteDni());
        entity.setRepresentanteLegal(user.getRepresentanteLegal());
        entity.setRuc(user.getRuc());

        Instant now = Instant.now();
        if (entity.getCreatedAt() == null) {
            entity.setCreatedAt(now);
        }
        entity.setUpdatedAt(now);

        return entity;
    }

    public User toDomain(UserJpaEntity entity) {
        return User.restore(
                new UserId(entity.getId()),
                new Email(entity.getEmail()),
                entity.getFullName(),
                entity.getDni(),
                entity.getPhone(),
                entity.getPasswordHash(),
                UserRole.valueOf(entity.getRole()),
                UserStatus.valueOf(entity.getStatus()),
                entity.getRepresentanteDni(),
                entity.getRepresentanteLegal(),
                entity.getRuc()
        );
    }
}
