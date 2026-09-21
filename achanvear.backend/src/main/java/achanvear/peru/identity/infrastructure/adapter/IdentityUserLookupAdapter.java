package achanvear.peru.identity.infrastructure.adapter;

import achanvear.peru.identity.domain.model.Email;
import achanvear.peru.identity.domain.model.User;
import achanvear.peru.identity.domain.model.UserId;
import achanvear.peru.identity.domain.model.UserRole;
import achanvear.peru.identity.domain.repository.UserRepository;
import achanvear.peru.shared.application.port.IdentityUserLookupPort;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
public class IdentityUserLookupAdapter implements IdentityUserLookupPort {

    private final UserRepository userRepository;

    public IdentityUserLookupAdapter(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public IdentityUserSummary findById(UUID userId) {
        return userRepository.findById(UserId.from(userId.toString()))
                .map(this::toSummary)
                .orElse(null);
    }

    @Override
    public Optional<IdentityUserSummary> findByEmail(String email) {
        return userRepository.findByEmail(new Email(email))
                .map(this::toSummary);
    }

    @Override
    public IdentityUserSummary createUser(String email, String fullName, String passwordHash, String role) {
        User user = User.create(
                UserId.generate(),
                new Email(email),
                fullName,
                null,
                null,
                passwordHash,
                UserRole.valueOf(role)
        );
        userRepository.save(user);
        return toSummary(user);
    }

    @Override
    public void updateRole(UUID userId, String newRole) {
        userRepository.findById(UserId.from(userId.toString())).ifPresent(user -> {
            user.changeRole(UserRole.valueOf(newRole));
            userRepository.save(user);
        });
    }

    private IdentityUserSummary toSummary(User user) {
        return new IdentityUserSummary(
                user.getId().value(),
                user.getEmail().value(),
                user.getFullName(),
                user.getRole().name(),
                user.getStatus().name(),
                user.getPasswordHash()
        );
    }
}
