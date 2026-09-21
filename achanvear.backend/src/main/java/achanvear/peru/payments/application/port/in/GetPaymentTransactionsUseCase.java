package achanvear.peru.payments.application.port.in;

import achanvear.peru.payments.application.dto.PaymentTransactionPageResponse;

import java.util.UUID;

public interface GetPaymentTransactionsUseCase {
    PaymentTransactionPageResponse execute(UUID userId, int page, int size);
}
