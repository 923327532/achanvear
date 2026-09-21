package achanvear.peru.identity.infrastructure.external;

import achanvear.peru.shared.application.port.IdentityFreelancerLookupPort;
import achanvear.peru.identity.application.port.in.UserLookupService;
import achanvear.peru.identity.domain.model.UserId;
import achanvear.peru.shared.domain.exception.ResourceNotFoundException;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class FreelanceIdentityLookupAdapter implements IdentityFreelancerLookupPort {

    private final UserLookupService userLookupService;

    public FreelanceIdentityLookupAdapter(UserLookupService userLookupService) {
        this.userLookupService = userLookupService;
    }

    @Override
    public boolean existsUser(UUID userId) {
        return userLookupService.existsById(new UserId(userId));
    }

    @Override
    public IdentityFreelancerLookupPort.FreelancerUserSummary findById(UUID userId) {
        return userLookupService.findById(new UserId(userId))
                .map(user -> new IdentityFreelancerLookupPort.FreelancerUserSummary(
                        user.getId().value(),
                        user.getEmail().value(),
                        user.getFullName(),
                        user.getDni(),
                        user.getPhone(),
                        user.getRole().name(),
                        user.getStatus().name()
                ))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
