package achanvear.peru.payments.application.service;

import achanvear.peru.payments.domain.model.*;
import achanvear.peru.payments.domain.repository.*;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/** Reads settled amounts from escrow snapshots and spendable balance from the wallet. */
@Service
public class PaymentFinancialQueryService {
    private final EscrowRepository escrows;
    private final WalletRepository wallets;

    public PaymentFinancialQueryService(EscrowRepository escrows, WalletRepository wallets) {
        this.escrows = escrows;
        this.wallets = wallets;
    }

    public List<Escrow> freelancerEscrows(UUID userId) { return escrows.findByFreelancerUserId(userId); }

    public Summary freelancerSummary(UUID userId) { return summarize(freelancerEscrows(userId), userId); }
    public Summary clientSummary(UUID userId) { return summarize(escrows.findByClientUserId(userId), userId); }

    private Summary summarize(List<Escrow> records, UUID userId) {
        BigDecimal gross = BigDecimal.ZERO, pending = BigDecimal.ZERO, platform = BigDecimal.ZERO;
        BigDecimal processor = BigDecimal.ZERO, net = BigDecimal.ZERO;
        for (Escrow escrow : records) {
            if (escrow.getStatus() == EscrowStatus.RELEASED) {
                gross = gross.add(escrow.getAmount());
                platform = platform.add(escrow.getPlatformCommission());
                processor = processor.add(escrow.getMpCommission());
                net = net.add(escrow.getFreelancerAmount());
            } else if (escrow.getStatus() == EscrowStatus.HELD || escrow.getStatus() == EscrowStatus.DISPUTED) {
                pending = pending.add(escrow.getAmount());
            }
        }
        BigDecimal available = wallets.findByUserId(userId).map(Wallet::getBalance).orElse(BigDecimal.ZERO);
        return new Summary(gross, pending, platform, processor, net, available);
    }

    public record Summary(BigDecimal gross, BigDecimal pending, BigDecimal platform,
                          BigDecimal processor, BigDecimal net, BigDecimal available) {
        public BigDecimal commissions() { return platform.add(processor); }
    }
}
