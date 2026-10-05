package achanvear.peru.payments.application.impl;

import achanvear.peru.payments.application.command.CreateSubscriptionCommand;
import achanvear.peru.payments.application.port.in.CreateSubscriptionUseCase;
import achanvear.peru.payments.domain.model.Subscription;
import achanvear.peru.payments.domain.repository.SubscriptionRepository;
import achanvear.peru.payments.infrastructure.external.CulqiGateway;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CreateSubscriptionUseCaseImpl implements CreateSubscriptionUseCase {

    private final SubscriptionRepository subscriptionRepository;
    private final CulqiGateway culqiGateway;

    public CreateSubscriptionUseCaseImpl(
            SubscriptionRepository subscriptionRepository,
            CulqiGateway culqiGateway
    ) {
        this.subscriptionRepository = subscriptionRepository;
        this.culqiGateway = culqiGateway;
    }

    @Override
    public String execute(CreateSubscriptionCommand command) {
        // Cobrar la suscripción con Culqi (misma pasarela que el resto de pagos)
        var charge = culqiGateway.createSubscriptionCharge(
                command.plan(),
                command.token(),
                command.companyEmail(),
                command.companyUserId()
        );

        if (charge == null || !charge.isApproved()) {
            throw new IllegalStateException("Culqi subscription payment was not approved");
        }

        // Persistir (las fechas se calculan automáticamente en Subscription.create)
        Subscription subscription = Subscription.create(
                command.companyUserId(),
                command.plan(),
                charge.id()
        );

        subscriptionRepository.save(subscription);

        return charge.id();
    }
}