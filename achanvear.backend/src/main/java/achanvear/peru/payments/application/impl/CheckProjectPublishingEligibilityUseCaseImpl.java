package achanvear.peru.payments.application.impl;

import achanvear.peru.payments.application.dto.ProjectPublishingEligibilityResponse;
import achanvear.peru.payments.application.port.in.CheckProjectPublishingEligibilityUseCase;
import achanvear.peru.jobs.domain.repository.JobPostRepository;
import achanvear.peru.payments.domain.model.PlanType;
import achanvear.peru.payments.domain.model.ProjectPublishingPolicy;
import achanvear.peru.payments.domain.repository.SubscriptionRepository;
import achanvear.peru.shared.application.port.CompanyLookupPort;
import achanvear.peru.shared.domain.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class CheckProjectPublishingEligibilityUseCaseImpl implements CheckProjectPublishingEligibilityUseCase {

    private final SubscriptionRepository subscriptionRepository;
    private final CompanyLookupPort companyLookupPort;
    private final JobPostRepository jobPostRepository;

    public CheckProjectPublishingEligibilityUseCaseImpl(
            SubscriptionRepository subscriptionRepository,
            CompanyLookupPort companyLookupPort,
            JobPostRepository jobPostRepository
    ) {
        this.subscriptionRepository = subscriptionRepository;
        this.companyLookupPort = companyLookupPort;
        this.jobPostRepository = jobPostRepository;
    }

    @Override
    public ProjectPublishingEligibilityResponse execute(UUID companyUserId) {
        CompanyLookupPort.CompanySummary company = companyLookupPort.findByOwnerUserId(companyUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));

        var subscription = subscriptionRepository.findActiveByCompanyUserId(companyUserId);
        boolean hasActiveSubscription = subscription.isPresent();
        PlanType currentPlan = subscription.map(sub -> sub.getPlan()).orElse(PlanType.FREE);
        int currentProjects = (int) jobPostRepository.countByCompanyIdSince(company.id(), company.createdAt());

        boolean canPublish = ProjectPublishingPolicy.canPublishJob(
                currentPlan, currentProjects, hasActiveSubscription, company.createdAt()
        );

        int remainingFree = ProjectPublishingPolicy.remainingFreeJobs(currentProjects);
        String message = ProjectPublishingPolicy.getJobUpgradeMessage(currentProjects, company.createdAt());
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
