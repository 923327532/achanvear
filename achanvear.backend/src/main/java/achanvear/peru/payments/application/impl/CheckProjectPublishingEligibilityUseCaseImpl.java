package achanvear.peru.payments.application.impl;

import achanvear.peru.payments.application.dto.ProjectPublishingEligibilityResponse;
import achanvear.peru.payments.application.port.in.CheckProjectPublishingEligibilityUseCase;
import achanvear.peru.payments.domain.model.PlanType;
import achanvear.peru.payments.domain.model.ProjectPublishingPolicy;
import achanvear.peru.payments.domain.repository.CompanyProjectStatsRepository;
import achanvear.peru.payments.domain.repository.SubscriptionRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class CheckProjectPublishingEligibilityUseCaseImpl implements CheckProjectPublishingEligibilityUseCase {

    private final CompanyProjectStatsRepository statsRepository;
    private final SubscriptionRepository subscriptionRepository;

    public CheckProjectPublishingEligibilityUseCaseImpl(
            CompanyProjectStatsRepository statsRepository,
            SubscriptionRepository subscriptionRepository
    ) {
        this.statsRepository = statsRepository;
        this.subscriptionRepository = subscriptionRepository;
    }

    @Override
    public ProjectPublishingEligibilityResponse execute(UUID companyUserId) {
        int currentProjects = statsRepository.countPublishedProjectsByCompany(companyUserId);
        boolean hasActiveSubscription = statsRepository.hasActiveSubscription(companyUserId);

        PlanType currentPlan = subscriptionRepository.findByCompanyUserId(companyUserId)
                .filter(sub -> sub.isActive())
                .map(sub -> sub.getPlan())
                .orElse(PlanType.FREE);

        boolean canPublish = ProjectPublishingPolicy.canPublishProject(
                currentPlan, currentProjects, hasActiveSubscription
        );

        int remainingFree = ProjectPublishingPolicy.remainingFreeProjects(currentProjects);
        String message = ProjectPublishingPolicy.getUpgradeMessage(currentProjects);
        boolean requiresUpgrade = !canPublish;

        return new ProjectPublishingEligibilityResponse(
                canPublish,
                currentProjects,
                currentPlan.maxProjects(),
                remainingFree,
                message,
                requiresUpgrade
        );
    }
}
