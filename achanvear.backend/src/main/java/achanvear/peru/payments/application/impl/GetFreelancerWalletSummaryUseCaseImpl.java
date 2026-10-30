package achanvear.peru.payments.application.impl;

import achanvear.peru.payments.application.dto.*;
import achanvear.peru.payments.application.port.in.GetFreelancerWalletSummaryUseCase;
import achanvear.peru.payments.application.service.PaymentFinancialQueryService;
import achanvear.peru.payments.domain.model.*;
import achanvear.peru.payments.domain.repository.MilestoneRepository;
import org.springframework.stereotype.Service;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.UUID;

@Service
public class GetFreelancerWalletSummaryUseCaseImpl implements GetFreelancerWalletSummaryUseCase {
    private final PaymentFinancialQueryService finances;
    private final MilestoneRepository milestones;
    private final achanvear.peru.payments.application.port.out.PaymentProjectLookup projects;
    public GetFreelancerWalletSummaryUseCaseImpl(PaymentFinancialQueryService finances, MilestoneRepository milestones, achanvear.peru.payments.application.port.out.PaymentProjectLookup projects) {
        this.projects = projects;
        this.finances = finances;
        this.milestones = milestones;
    }
    @Override
    public FreelancerWalletSummaryResponse execute(UUID userId) {
        var summary = finances.freelancerSummary(userId);
        var milestoneTitles = milestones.findByFreelancerUserId(userId).stream().collect(
                java.util.stream.Collectors.toMap(m -> m.getId().value(), Milestone::getTitle));
        var escrows = finances.freelancerEscrows(userId);
        var titles = projects.findTitles(escrows.stream().map(Escrow::getProjectId).distinct().toList());
        var recent = escrows.stream()
                .filter(e -> e.getStatus() == EscrowStatus.RELEASED)
                .sorted(Comparator.comparing(Escrow::getReleasedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .map(e -> new ProjectPaymentRowResponse(e.getProjectId().toString(),
                        titles.get(e.getProjectId()), e.getMilestoneId().toString(),
                        milestoneTitles.getOrDefault(e.getMilestoneId(), "Hito"),
                        e.getAmount(), e.getPlatformCommission(), e.getMpCommission(), e.getFreelancerAmount(),
                        e.getStatus().name(), e.getReleasedAt() == null ? null : DateTimeFormatter.ISO_INSTANT.format(e.getReleasedAt())))
                .toList();
        return new FreelancerWalletSummaryResponse(summary.gross(), summary.pending(), summary.available(),
                summary.platform(), summary.processor(), summary.net(), recent, "PEN");
    }
}
