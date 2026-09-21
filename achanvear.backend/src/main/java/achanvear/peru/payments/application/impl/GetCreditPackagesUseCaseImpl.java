package achanvear.peru.payments.application.impl;

import achanvear.peru.payments.application.dto.CreditPackageResponse;
import achanvear.peru.payments.application.port.in.GetCreditPackagesUseCase;
import achanvear.peru.payments.infrastructure.persistence.CreditPackageJpaEntity;
import achanvear.peru.payments.infrastructure.persistence.CreditPackageRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GetCreditPackagesUseCaseImpl implements GetCreditPackagesUseCase {

    private final CreditPackageRepository creditPackageRepository;

    public GetCreditPackagesUseCaseImpl(CreditPackageRepository creditPackageRepository) {
        this.creditPackageRepository = creditPackageRepository;
    }

    @Override
    public List<CreditPackageResponse> execute() {
        List<CreditPackageJpaEntity> packages = creditPackageRepository.findAllActiveOrdered();
        return packages.stream()
                .map(this::toResponse)
                .toList();
    }

    private CreditPackageResponse toResponse(CreditPackageJpaEntity pkg) {
        double pricePerCredit = pkg.getPrice().doubleValue() / pkg.getCredits();

        return new CreditPackageResponse(
                pkg.getId(),
                pkg.getName(),
                pkg.getDescription(),
                pkg.getCredits(),
                pkg.getPrice().intValue(),
                Math.round(pricePerCredit * 100.0) / 100.0,
                pkg.getSavingsPercentage(),
                pkg.isPopular(),
                pkg.isActive()
        );
    }
}
