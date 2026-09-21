package achanvear.peru.shared.application.port;

import java.util.Optional;
import java.util.UUID;

public interface IdentityUserLookupPort {

    IdentityUserSummary findById(UUID userId);

    Optional<IdentityUserSummary> findByEmail(String email);

    IdentityUserSummary createUser(String email, String fullName, String passwordHash, String role);

    void updateRole(UUID userId, String newRole);

    record IdentityUserSummary(
            UUID id,
            String email,
            String fullName,
            String role,
            String status,
            String passwordHash
    ) {
    }
}
