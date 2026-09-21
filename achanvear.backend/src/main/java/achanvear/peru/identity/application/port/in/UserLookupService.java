package achanvear.peru.identity.application.port.in;

import achanvear.peru.identity.domain.model.User;
import achanvear.peru.identity.domain.model.UserId;

import java.util.Optional;

public interface UserLookupService {
    
    Optional<User> findById(UserId userId);
    
    boolean existsById(UserId userId);
}
