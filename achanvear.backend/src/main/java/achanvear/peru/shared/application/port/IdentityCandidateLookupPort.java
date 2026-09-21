package achanvear.peru.shared.application.port;

import java.util.UUID;

public interface IdentityCandidateLookupPort {

    CandidateSummary findById(UUID candidateUserId);

    record CandidateSummary(
            UUID id,
            String email,
            String role,
            String status,
            String fullName
    ) {}
}
