package achanvear.peru.identity.infrastructure.persistence;

import achanvear.peru.identity.application.factory.UserFactory;
import achanvear.peru.identity.application.port.in.UserCreatorPort;
import achanvear.peru.identity.domain.model.Email;
import achanvear.peru.identity.domain.model.User;
import achanvear.peru.identity.domain.model.UserRole;
import achanvear.peru.identity.domain.repository.UserRepository;
import achanvear.peru.shared.application.EventPublisher;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class UserCreatorPortImpl implements UserCreatorPort {

    private final UserRepository userRepository;
    private final UserFactory userFactory;
    private final EventPublisher eventPublisher;

    public UserCreatorPortImpl(
            UserRepository userRepository,
            UserFactory userFactory,
            EventPublisher eventPublisher
    ) {
        this.userRepository = userRepository;
        this.userFactory = userFactory;
        this.eventPublisher = eventPublisher;
    }

    @Override
    @Transactional
    public User createUser(String email, String fullName, String dni, String phone, String passwordHash, UserRole role) {
        if (userRepository.existsByEmail(new Email(email))) {
            throw new IllegalArgumentException("Ya existe un usuario con el correo " + email);
        }
        if (role == UserRole.FREELANCER && dni != null && !dni.isBlank() && userRepository.existsByDni(dni)) {
            throw new IllegalArgumentException("Ya existe un usuario con el DNI " + dni);
        }

        User user = userFactory.create(new Email(email), fullName, dni, phone, passwordHash, role);
        userRepository.save(user);

        // Publicar eventos de dominio (p. ej. creación de perfil de freelancer)
        user.pullDomainEvents().forEach(eventPublisher::publish);

        return user;
    }
}
