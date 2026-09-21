package achanvear.peru.payments.application.port.in;

import achanvear.peru.payments.application.dto.PaymentsOverviewResponse;

import java.util.UUID;

public interface GetPaymentsOverviewUseCase {
    PaymentsOverviewResponse execute(UUID userId);
}
