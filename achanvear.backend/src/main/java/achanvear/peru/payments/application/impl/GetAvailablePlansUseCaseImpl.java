package achanvear.peru.payments.application.impl;

import achanvear.peru.payments.application.dto.PlanOptionResponse;
import achanvear.peru.payments.application.port.in.GetAvailablePlansUseCase;
import achanvear.peru.payments.infrastructure.persistence.PlanJpaEntity;
import achanvear.peru.payments.infrastructure.persistence.PlanRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GetAvailablePlansUseCaseImpl implements GetAvailablePlansUseCase {

    private final PlanRepository planRepository;

    public GetAvailablePlansUseCaseImpl(PlanRepository planRepository) {
        this.planRepository = planRepository;
    }

    @Override
    public List<PlanOptionResponse> execute() {
        List<PlanJpaEntity> plans = planRepository.findAllActiveOrdered();
        return plans.stream()
                .map(this::toResponse)
                .toList();
    }

    private PlanOptionResponse toResponse(PlanJpaEntity plan) {
        List<String> benefits = planRepository.findBenefitsByPlanId(plan.getId())
                .stream()
                .map(b -> b.getBenefitText())
                .toList();

        return new PlanOptionResponse(
                plan.getId(),
                plan.getName(),
                plan.getMonthlyPrice().intValue(),
                plan.getYearlyPrice().intValue(),
                plan.getMaxProjects(),
                plan.getMaxInvitesPerProject(),
                benefits.toArray(new String[0]),
                plan.isPopular(),
                plan.isActive(),
                plan.getDescription()
        );
    }
}