package achanvear.peru.payments.application.impl;

import achanvear.peru.payments.application.command.CreateSubscriptionCommand;
import achanvear.peru.payments.application.port.in.CreateSubscriptionUseCase;
import achanvear.peru.payments.domain.model.Subscription;
import achanvear.peru.payments.domain.repository.SubscriptionRepository;
import achanvear.peru.payments.infrastructure.external.MercadoPagoGateway;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
@Transactional
public class CreateSubscriptionUseCaseImpl implements CreateSubscriptionUseCase {

    private final SubscriptionRepository subscriptionRepository;
    private final MercadoPagoGateway mercadoPagoGateway;

    public CreateSubscriptionUseCaseImpl(
            SubscriptionRepository subscriptionRepository,
            MercadoPagoGateway mercadoPagoGateway
    ) {
        this.subscriptionRepository = subscriptionRepository;
        this.mercadoPagoGateway = mercadoPagoGateway;
    }

    @Override
    public String execute(CreateSubscriptionCommand command) {
        // Crear en Mercado Pago
        var mpSubscription = mercadoPagoGateway.createSubscription(
                command.plan(),
                command.companyUserId().toString(),
                command.companyEmail()
        );

        // Persistir (las fechas se calculan automáticamente en Subscription.create)
        Subscription subscription = Subscription.create(
                command.companyUserId(),
                command.plan(),
                mpSubscription.id()
        );

        subscriptionRepository.save(subscription);

        return mpSubscription.initPoint();
    }
}