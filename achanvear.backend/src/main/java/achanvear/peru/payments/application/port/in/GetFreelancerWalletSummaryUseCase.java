package achanvear.peru.payments.application.port.in;

import achanvear.peru.payments.application.dto.FreelancerWalletSummaryResponse;

import java.util.UUID;

public interface GetFreelancerWalletSummaryUseCase {
    FreelancerWalletSummaryResponse execute(UUID freelancerUserId);
}
