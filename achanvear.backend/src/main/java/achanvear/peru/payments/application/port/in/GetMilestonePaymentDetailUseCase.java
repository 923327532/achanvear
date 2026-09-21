package achanvear.peru.payments.application.port.in;

import achanvear.peru.payments.application.dto.MilestonePaymentDetailResponse;

import java.util.UUID;

public interface GetMilestonePaymentDetailUseCase {
    MilestonePaymentDetailResponse execute(UUID milestoneId);
}
