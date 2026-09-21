package achanvear.peru.payments.application.port.in;

import achanvear.peru.payments.application.dto.CurrentPlanResponse;

import java.util.UUID;

public interface GetCurrentPlanUseCase {
    CurrentPlanResponse execute(UUID companyUserId);
}
