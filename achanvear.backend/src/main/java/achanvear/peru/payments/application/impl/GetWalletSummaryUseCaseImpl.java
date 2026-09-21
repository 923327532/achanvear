package achanvear.peru.payments.application.impl;

import achanvear.peru.payments.application.dto.WalletSummaryResponse;
import achanvear.peru.payments.application.port.in.GetWalletSummaryUseCase;
import achanvear.peru.payments.domain.model.Subscription;
import achanvear.peru.payments.domain.model.SubscriptionStatus;
import achanvear.peru.payments.domain.repository.PaymentRepository;
import achanvear.peru.payments.domain.repository.SubscriptionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class GetWalletSummaryUseCaseImpl implements GetWalletSummaryUseCase {

    private final PaymentRepository paymentRepository;
    private final SubscriptionRepository subscriptionRepository;

    public GetWalletSummaryUseCaseImpl(
            PaymentRepository paymentRepository,
            SubscriptionRepository subscriptionRepository
    ) {
        this.paymentRepository = paymentRepository;
        this.subscriptionRepository = subscriptionRepository;
    }

    @Override
    public WalletSummaryResponse execute(UUID userId) {
        // Total ganado como freelancer
        BigDecimal totalEarned = paymentRepository.getTotalFreelancerAmountByUserId(userId);
        BigDecimal totalCommissionsPaid = paymentRepository.getTotalCommissionsByUserId(userId);

        // Suscripcion activa para empresas
        var activeSubscription = subscriptionRepository.findByCompanyUserId(userId)
                .filter(sub -> sub.getStatus() == SubscriptionStatus.ACTIVE);

        return new WalletSummaryResponse(
                totalEarned != null ? totalEarned : BigDecimal.ZERO,
                totalCommissionsPaid != null ? totalCommissionsPaid : BigDecimal.ZERO,
                activeSubscription.map(s -> s.getPlan().name()).orElse(null),
                activeSubscription.map(Subscription::getEndDate).orElse(null)
        );
    }
}
