package achanvear.peru.identity.infrastructure.persistence;

import achanvear.peru.identity.application.port.in.UserStatusChangerPort;
import achanvear.peru.identity.domain.model.User;
import achanvear.peru.identity.domain.model.UserId;
import achanvear.peru.identity.domain.model.UserStatus;
import achanvear.peru.identity.domain.repository.UserRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class UserStatusChangerPortImpl implements UserStatusChangerPort {

    private final UserRepository userRepository;

    public UserStatusChangerPortImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public void changeStatus(String userId, String newStatus) {
        User user = userRepository.findById(UserId.from(userId))
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        UserStatus target = UserStatus.valueOf(newStatus.toUpperCase());
        switch (target) {
            case ACTIVE -> user.activate();
            case BLOCKED -> user.block();
            case DISABLED -> user.disable();
            default -> throw new IllegalArgumentException("Unsupported user status: " + newStatus);
        }
        userRepository.save(user);
    }
}
