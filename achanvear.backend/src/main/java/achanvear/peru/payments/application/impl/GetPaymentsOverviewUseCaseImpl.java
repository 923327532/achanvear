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

    public GetPaymentsOverviewUseCaseImpl(
            CompanyProjectStatsRepository statsRepository,
            SubscriptionRepository subscriptionRepository,
            MilestoneRepository milestoneRepository
    ) {
        this.statsRepository = statsRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.milestoneRepository = milestoneRepository;
    }

    @Override
    public PaymentsOverviewResponse execute(UUID userId) {
        // Obtener estadísticas de suscripción
        int publishedProjects = statsRepository.countPublishedProjectsByCompany(userId);
        boolean hasActiveSubscription = statsRepository.hasActiveSubscription(userId);

        var subscriptionOpt = subscriptionRepository.findByCompanyUserId(userId);
        PlanType currentPlan = subscriptionOpt
                .filter(sub -> sub.isActive())
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
        BigDecimal totalCommissions = totalEarned.multiply(new BigDecimal("0.0913"));
        BigDecimal availableForWithdrawal = totalEarned.subtract(totalCommissions);

        // Construir mensaje de upgrade
        String upgradeMessage = ProjectPublishingPolicy.getUpgradeMessage(publishedProjects);

        // Fecha de expiración del plan
        String planExpirationDate = subscriptionOpt
                .filter(sub -> sub.isActive())
                .map(sub -> DateTimeFormatter.ISO_INSTANT.format(sub.getEndDate()))
                .orElse(null);

        return new PaymentsOverviewResponse(
                publishedProjects,
                ProjectPublishingPolicy.remainingFreeProjects(publishedProjects),
                currentPlan.canPublishProject(publishedProjects),
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
