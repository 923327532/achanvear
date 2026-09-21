package achanvear.peru.freelance.application.port.out;

import achanvear.peru.freelance.domain.model.FreelancerProfile;

import java.util.Optional;
import java.util.UUID;

public interface IdentityFreelancerLookupPort {

    // TODO: Implementar con el servicio de identidad cuando esté disponible
    Optional<FreelancerProfile> findByUserId(UUID userId);

    boolean existsUser(UUID userId);

    FreelancerUserSummary findById(UUID userId);

    record FreelancerUserSummary(
            UUID id,
            String email,
            String role,
            String status
    ) {
    }
}