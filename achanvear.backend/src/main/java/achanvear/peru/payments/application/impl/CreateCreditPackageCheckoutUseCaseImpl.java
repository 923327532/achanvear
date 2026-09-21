package achanvear.peru.payments.application.impl;

import achanvear.peru.payments.application.command.CreateCreditPackageCheckoutCommand;
import achanvear.peru.payments.application.port.in.CreateCreditPackageCheckoutUseCase;
import achanvear.peru.payments.infrastructure.external.MercadoPagoGateway;
import achanvear.peru.payments.infrastructure.external.MercadoPagoPreferenceResponse;
import achanvear.peru.payments.infrastructure.persistence.CreditPackageJpaEntity;
import achanvear.peru.payments.infrastructure.persistence.CreditPackageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Compra de paquetes de créditos con Mercado Pago (checkout).
 */
@Service
@Transactional
public class CreateCreditPackageCheckoutUseCaseImpl implements CreateCreditPackageCheckoutUseCase {

    private final CreditPackageRepository creditPackageRepository;
    private final MercadoPagoGateway mercadoPagoGateway;

    public CreateCreditPackageCheckoutUseCaseImpl(
            CreditPackageRepository creditPackageRepository,
            MercadoPagoGateway mercadoPagoGateway
    ) {
        this.creditPackageRepository = creditPackageRepository;
        this.mercadoPagoGateway = mercadoPagoGateway;
    }

    @Override
    public String execute(CreateCreditPackageCheckoutCommand command) {
        CreditPackageJpaEntity pkg = creditPackageRepository.findById(command.packageId())
                .filter(CreditPackageJpaEntity::isActive)
                .orElseThrow(() -> new IllegalArgumentException("Paquete de créditos no encontrado"));

        MercadoPagoPreferenceResponse preference = mercadoPagoGateway.createCreditPackagePreference(
                pkg.getId(),
                pkg.getName(),
                pkg.getPrice(),
                command.clientEmail()
        );

        return preference.initPoint() != null ? preference.initPoint() : preference.sandboxInitPoint();
    }
}
