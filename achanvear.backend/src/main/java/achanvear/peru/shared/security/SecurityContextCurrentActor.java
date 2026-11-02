package achanvear.peru.shared.security;

import achanvear.peru.shared.application.port.CurrentActorPort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class SecurityContextCurrentActor implements CurrentActorPort {
    @Override
    public Optional<Actor> current() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof AuthenticatedUser user)) {
            return Optional.empty();
        }
        return Optional.of(new Actor(user.getUserId(), user.getCompanyId(), user.getRole(), user.isSuperAdmin()));
    }
}
