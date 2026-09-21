package achanvear.peru.payments.application.port.in;

import achanvear.peru.payments.application.dto.ProjectPublishingEligibilityResponse;

import java.util.UUID;

public interface CheckProjectPublishingEligibilityUseCase {
    ProjectPublishingEligibilityResponse execute(UUID companyUserId);
}
