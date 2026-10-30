package achanvear.peru.payments.application.impl;

import achanvear.peru.payments.application.dto.PaymentsOverviewResponse;
import achanvear.peru.payments.application.port.in.GetPaymentsOverviewUseCase;
import achanvear.peru.payments.domain.model.PlanType;
import achanvear.peru.payments.domain.model.ProjectPublishingPolicy;
import achanvear.peru.payments.domain.repository.SubscriptionRepository;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class GetPaymentsOverviewUseCaseImpl implements GetPaymentsOverviewUseCase {

    private final achanvear.peru.payments.application.service.PaymentFinancialQueryService finances;
    private final SubscriptionRepository subscriptionRepository;
    private final achanvear.peru.shared.application.port.CompanyLookupPort companies;
    private final achanvear.peru.jobs.domain.repository.JobPostRepository jobs;
    private final achanvear.peru.payments.application.service.PublicationCreditService credits;

    public GetPaymentsOverviewUseCaseImpl(
            SubscriptionRepository subscriptionRepository,
            achanvear.peru.shared.application.port.CompanyLookupPort companies,
            achanvear.peru.jobs.domain.repository.JobPostRepository jobs,
            achanvear.peru.payments.application.service.PublicationCreditService credits,
            achanvear.peru.payments.application.service.PaymentFinancialQueryService finances
    ) {
        this.finances = finances;
        this.subscriptionRepository = subscriptionRepository;
        this.companies = companies; this.jobs = jobs; this.credits = credits;
    }

    @Override
    public PaymentsOverviewResponse execute(UUID userId) {
        // Obtener estadísticas de suscripción
        var company = companies.findByOwnerUserId(userId);
        int publishedProjects = company.map(c -> (int) jobs.countByCompanyIdSince(c.id(), c.createdAt())).orElse(0);
        java.time.Instant createdAt = company.map(c -> c.createdAt()).orElse(null);
        var subscriptionOpt = subscriptionRepository.findActiveByCompanyUserId(userId);
        PlanType currentPlan = subscriptionOpt
                .map(sub -> sub.getPlan())
                .orElse(PlanType.FREE);

        // Calcular métricas para freelancers (milestones liberados)
        var financial = company.isPresent() ? finances.clientSummary(userId) : finances.freelancerSummary(userId);

        String upgradeMessage = company.isPresent() && subscriptionOpt.isEmpty() ? ProjectPublishingPolicy.getJobUpgradeMessage(publishedProjects, createdAt) : null;

        // Fecha de expiración del plan
        String planExpirationDate = subscriptionOpt
                .map(sub -> DateTimeFormatter.ISO_INSTANT.format(sub.getEndDate()))
                .orElse(createdAt != null ? DateTimeFormatter.ISO_INSTANT.format(createdAt.plus(ProjectPublishingPolicy.FREE_PLAN_DAYS, java.time.temporal.ChronoUnit.DAYS)) : null);

        return new PaymentsOverviewResponse(
                company.isPresent() ? publishedProjects : null,
                company.isEmpty() ? null : ProjectPublishingPolicy.isFreeTrialActive(createdAt) ? ProjectPublishingPolicy.remainingFreeJobs(publishedProjects) : 0,
                company.isPresent() && (ProjectPublishingPolicy.canPublishJob(currentPlan, publishedProjects, subscriptionOpt.isPresent(), createdAt) || credits.getBalance(userId) > 0),
                company.isPresent() ? currentPlan.name() : null,
                company.isPresent() ? planExpirationDate : null,
                financial.gross(),
                financial.pending(),
                financial.available(),
                financial.commissions(),
                upgradeMessage
        );
    }
}
