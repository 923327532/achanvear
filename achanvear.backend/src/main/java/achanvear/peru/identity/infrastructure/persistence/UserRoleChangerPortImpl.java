package achanvear.peru.identity.infrastructure.persistence;

import achanvear.peru.identity.application.port.in.UserRoleChangerPort;
import achanvear.peru.identity.domain.model.User;
import achanvear.peru.identity.domain.model.UserId;
import achanvear.peru.identity.domain.model.UserRole;
import achanvear.peru.identity.domain.repository.UserRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class UserRoleChangerPortImpl implements UserRoleChangerPort {

    private final UserRepository userRepository;

    public UserRoleChangerPortImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public void changeRole(String userId, UserRole newRole) {
        User user = userRepository.findById(UserId.from(userId))
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        user.changeRole(newRole);
        userRepository.save(user);
    }
}
