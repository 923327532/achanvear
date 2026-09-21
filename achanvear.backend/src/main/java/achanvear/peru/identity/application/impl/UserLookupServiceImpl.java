package achanvear.peru.identity.application.impl;

import achanvear.peru.identity.application.port.in.UserLookupService;
import achanvear.peru.identity.domain.model.User;
import achanvear.peru.identity.domain.model.UserId;
import achanvear.peru.identity.domain.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserLookupServiceImpl implements UserLookupService {

    private final UserRepository userRepository;

    public UserLookupServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public Optional<User> findById(UserId userId) {
        return userRepository.findById(userId);
    }

    @Override
    public boolean existsById(UserId userId) {
        return userRepository.existsById(userId);
    }
}
