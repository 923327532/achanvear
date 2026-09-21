package achanvear.peru.payments.application.port.in;

import achanvear.peru.payments.application.dto.WalletSummaryResponse;

import java.util.UUID;

public interface GetWalletSummaryUseCase {
    WalletSummaryResponse execute(UUID userId);
}
