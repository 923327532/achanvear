package achanvear.peru.identity.domain.repository;

import achanvear.peru.identity.domain.model.Email;
import achanvear.peru.identity.domain.model.User;
import achanvear.peru.identity.domain.model.UserId;

import java.util.Optional;

public interface UserRepository {

    void save(User user);

    Optional<User> findById(UserId userId);

    Optional<User> findByEmail(Email email);

    boolean existsByEmail(Email email);

    boolean existsByDni(String dni);

    boolean existsById(UserId userId);
}
