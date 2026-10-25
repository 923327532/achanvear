package achanvear.peru.payments.application.impl;

import achanvear.peru.payments.application.dto.PaymentsOverviewResponse;
import achanvear.peru.payments.application.port.in.GetPaymentsOverviewUseCase;
import achanvear.peru.payments.domain.model.MilestoneStatus;
import achanvear.peru.payments.domain.model.PlanType;
import achanvear.peru.payments.domain.model.ProjectPublishingPolicy;
import achanvear.peru.payments.domain.repository.CompanyProjectStatsRepository;
import achanvear.peru.payments.domain.repository.MilestoneRepository;
import achanvear.peru.payments.domain.repository.SubscriptionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class GetPaymentsOverviewUseCaseImpl implements GetPaymentsOverviewUseCase {

    private final CompanyProjectStatsRepository statsRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final MilestoneRepository milestoneRepository;
    private final achanvear.peru.shared.application.port.CompanyLookupPort companies;
    private final achanvear.peru.jobs.domain.repository.JobPostRepository jobs;
    private final achanvear.peru.payments.application.service.PublicationCreditService credits;

    public GetPaymentsOverviewUseCaseImpl(
            CompanyProjectStatsRepository statsRepository,
            SubscriptionRepository subscriptionRepository,
            MilestoneRepository milestoneRepository,
            achanvear.peru.shared.application.port.CompanyLookupPort companies,
            achanvear.peru.jobs.domain.repository.JobPostRepository jobs,
            achanvear.peru.payments.application.service.PublicationCreditService credits
    ) {
        this.statsRepository = statsRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.milestoneRepository = milestoneRepository;
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
        var freelancerMilestones = milestoneRepository.findByFreelancerUserId(userId);
        BigDecimal totalEarned = freelancerMilestones.stream()
                .filter(m -> m.getStatus() == MilestoneStatus.RELEASED)
                .map(m -> m.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal pendingRelease = freelancerMilestones.stream()
                .filter(m -> m.getStatus() == MilestoneStatus.READY_FOR_REVIEW)
                .map(m -> m.getAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calcular comisiones (5% plataforma + 4.13% MP)
        BigDecimal totalCommissions = freelancerMilestones.stream()
                .filter(m -> m.getStatus() == MilestoneStatus.RELEASED)
                .map(m -> achanvear.peru.payments.domain.model.CommissionPolicy.calculateCommission(m.getAmount()))
                .map(c -> c.platformCommission().add(c.mpCommission()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal availableForWithdrawal = totalEarned.subtract(totalCommissions);

        // Construir mensaje de upgrade
        String upgradeMessage = ProjectPublishingPolicy.getJobUpgradeMessage(publishedProjects, createdAt);

        // Fecha de expiración del plan
        String planExpirationDate = subscriptionOpt
                .map(sub -> DateTimeFormatter.ISO_INSTANT.format(sub.getEndDate()))
                .orElse(null);

        return new PaymentsOverviewResponse(
                publishedProjects,
                ProjectPublishingPolicy.isFreeTrialActive(createdAt) ? ProjectPublishingPolicy.remainingFreeJobs(publishedProjects) : 0,
                ProjectPublishingPolicy.canPublishJob(currentPlan, publishedProjects, subscriptionOpt.isPresent(), createdAt) || credits.getBalance(userId) > 0,
                currentPlan.name(),
                planExpirationDate,
                totalEarned,
                pendingRelease,
                availableForWithdrawal,
                totalCommissions,
                upgradeMessage
        );
    }
}
