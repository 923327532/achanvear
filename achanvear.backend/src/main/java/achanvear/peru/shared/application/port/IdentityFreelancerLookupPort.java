package achanvear.peru.shared.application.port;

import java.util.UUID;

public interface IdentityFreelancerLookupPort {

    boolean existsUser(UUID userId);

    FreelancerUserSummary findById(UUID userId);

    record FreelancerUserSummary(
            UUID id,
            String email,
            String fullName,
            String dni,
            String phone,
            String role,
            String status
    ) {}
}