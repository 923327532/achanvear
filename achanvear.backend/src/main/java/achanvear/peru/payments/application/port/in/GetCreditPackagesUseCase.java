package achanvear.peru.payments.application.port.in;

import achanvear.peru.payments.application.dto.CreditPackageResponse;

import java.util.List;

public interface GetCreditPackagesUseCase {
    List<CreditPackageResponse> execute();
}
