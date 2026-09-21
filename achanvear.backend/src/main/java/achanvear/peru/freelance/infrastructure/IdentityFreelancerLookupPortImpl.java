package achanvear.peru.freelance.infrastructure;

import achanvear.peru.freelance.application.port.out.IdentityFreelancerLookupPort;
import achanvear.peru.freelance.domain.model.FreelancerProfile;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
public class IdentityFreelancerLookupPortImpl implements IdentityFreelancerLookupPort {

    // TODO: Implementar con el servicio de identidad cuando esté disponible
    @Override
    public Optional<FreelancerProfile> findByUserId(UUID userId) {
        // Implementación pendiente
        return Optional.empty();
    }

    @Override
    public boolean existsUser(UUID userId) {
        // Implementación pendiente
        return false;
    }

    @Override
    public FreelancerUserSummary findById(UUID userId) {
        return null;
    }
}
