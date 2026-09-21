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

    public GetCurrentPlanUseCaseImpl(
            SubscriptionRepository subscriptionRepository,
            CompanyProjectStatsRepository statsRepository
    ) {
        this.subscriptionRepository = subscriptionRepository;
        this.statsRepository = statsRepository;
    }

    @Override
    public CurrentPlanResponse execute(UUID companyUserId) {
        var subscriptionOpt = subscriptionRepository.findByCompanyUserId(companyUserId);

        if (subscriptionOpt.isEmpty() || !subscriptionOpt.get().isActive()) {
            // Plan FREE
            int projectsUsed = statsRepository.countPublishedProjectsByCompany(companyUserId);
            return new CurrentPlanResponse(
                    PlanType.FREE.name(),
                    "ACTIVE",
                    null,
                    null,
                    projectsUsed,
                    PlanType.FREE.maxProjects(),
                    true
            );
        }

        var subscription = subscriptionOpt.get();
        int projectsUsed = statsRepository.countPublishedProjectsByCompany(companyUserId);
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
