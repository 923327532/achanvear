package achanvear.peru.identity.infrastructure.adapter;

import achanvear.peru.identity.infrastructure.persistence.UserJpaEntity;
import achanvear.peru.identity.infrastructure.persistence.UserJpaRepository;
import achanvear.peru.shared.application.port.IdentityCandidateLookupPort;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class IdentityCandidateLookupAdapter implements IdentityCandidateLookupPort {

    private final UserJpaRepository userJpaRepository;

    public IdentityCandidateLookupAdapter(UserJpaRepository userJpaRepository) {
        this.userJpaRepository = userJpaRepository;
    }

    @Override
    public CandidateSummary findById(UUID candidateUserId) {
        UserJpaEntity user = userJpaRepository.findById(candidateUserId).orElse(null);

        if (user == null) {
            return null;
        }

        return new CandidateSummary(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.getStatus(),
                user.getFullName()
        );
    }
}
