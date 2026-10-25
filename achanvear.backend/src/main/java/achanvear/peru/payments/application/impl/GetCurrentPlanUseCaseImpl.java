package achanvear.peru.payments.application.impl;

import achanvear.peru.payments.application.dto.CurrentPlanResponse;
import achanvear.peru.payments.application.port.in.GetCurrentPlanUseCase;
import achanvear.peru.payments.domain.model.PlanType;
import achanvear.peru.payments.domain.repository.CompanyProjectStatsRepository;
import achanvear.peru.payments.domain.repository.SubscriptionRepository;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class GetCurrentPlanUseCaseImpl implements GetCurrentPlanUseCase {

    private final SubscriptionRepository subscriptionRepository;
    private final CompanyProjectStatsRepository statsRepository;
    private final achanvear.peru.shared.application.port.CompanyLookupPort companies;
    private final achanvear.peru.jobs.domain.repository.JobPostRepository jobs;

    public GetCurrentPlanUseCaseImpl(
            SubscriptionRepository subscriptionRepository,
            CompanyProjectStatsRepository statsRepository,
            achanvear.peru.shared.application.port.CompanyLookupPort companies,
            achanvear.peru.jobs.domain.repository.JobPostRepository jobs
    ) {
        this.subscriptionRepository = subscriptionRepository;
        this.statsRepository = statsRepository; this.companies = companies; this.jobs = jobs;
    }

    @Override
    public CurrentPlanResponse execute(UUID companyUserId) {
        var company = companies.findByOwnerUserId(companyUserId);
        int projectsUsed = company.map(c -> (int) jobs.countByCompanyIdSince(c.id(), c.createdAt())).orElse(0);
        var subscriptionOpt = subscriptionRepository.findActiveByCompanyUserId(companyUserId);

        if (subscriptionOpt.isEmpty()) {
            // Plan FREE

            return new CurrentPlanResponse(
                    PlanType.FREE.name(),
                    "ACTIVE",
                    null,
                    null,
                    projectsUsed,
                    achanvear.peru.payments.domain.model.ProjectPublishingPolicy.FREE_PLAN_JOB_LIMIT,
                    company.map(c -> achanvear.peru.payments.domain.model.ProjectPublishingPolicy.isFreeTrialActive(c.createdAt())).orElse(false)
            );
        }

        var subscription = subscriptionOpt.get();

        var formatter = DateTimeFormatter.ISO_INSTANT;

        return new CurrentPlanResponse(
                subscription.getPlan().name(),
                subscription.getStatus().name(),
                formatter.format(subscription.getStartDate()),
                formatter.format(subscription.getEndDate()),
                projectsUsed,
                subscription.getPlan().maxProjects(),
                subscription.isActive()
        );
    }
}
