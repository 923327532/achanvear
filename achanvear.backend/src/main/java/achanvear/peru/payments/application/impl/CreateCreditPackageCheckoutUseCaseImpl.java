package achanvear.peru.payments.application.impl;

import achanvear.peru.payments.application.command.CreateCreditPackageCheckoutCommand;
import achanvear.peru.payments.application.port.in.CreateCreditPackageCheckoutUseCase;
import achanvear.peru.payments.application.service.PublicationCreditService;
import achanvear.peru.payments.infrastructure.external.MercadoPagoGateway;
import achanvear.peru.payments.infrastructure.external.MercadoPagoPreferenceResponse;
import achanvear.peru.payments.infrastructure.persistence.CreditPackageJpaEntity;
import achanvear.peru.payments.infrastructure.persistence.CreditPackageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CreateCreditPackageCheckoutUseCaseImpl implements CreateCreditPackageCheckoutUseCase {

    private final CreditPackageRepository creditPackageRepository;
    private final MercadoPagoGateway mercadoPagoGateway;
    private final PublicationCreditService publicationCreditService;

    public CreateCreditPackageCheckoutUseCaseImpl(
            CreditPackageRepository creditPackageRepository,
            MercadoPagoGateway mercadoPagoGateway,
            PublicationCreditService publicationCreditService
    ) {
        this.creditPackageRepository = creditPackageRepository;
        this.mercadoPagoGateway = mercadoPagoGateway;
        this.publicationCreditService = publicationCreditService;
    }

    @Override
    public String execute(CreateCreditPackageCheckoutCommand command) {
        CreditPackageJpaEntity pkg = creditPackageRepository.findById(command.packageId())
                .filter(CreditPackageJpaEntity::isActive)
                .orElseThrow(() -> new IllegalArgumentException("Paquete de publicaciones no encontrado"));

        var purchaseId = publicationCreditService.createPendingPurchase(
                java.util.UUID.fromString(command.companyUserId()),
                pkg.getId()
        );

        MercadoPagoPreferenceResponse preference = mercadoPagoGateway.createCreditPackagePreference(
                purchaseId.toString(),
                pkg.getName(),
                pkg.getPrice(),
                command.clientEmail()
        );

        String checkoutUrl = preference.initPoint() != null && !preference.initPoint().isBlank()
                ? preference.initPoint()
                : preference.sandboxInitPoint();

        if (checkoutUrl == null || checkoutUrl.isBlank()) {
            throw new IllegalStateException("Mercado Pago no devolvio una URL de checkout para completar la compra");
        }

        return checkoutUrl;
    }
}
