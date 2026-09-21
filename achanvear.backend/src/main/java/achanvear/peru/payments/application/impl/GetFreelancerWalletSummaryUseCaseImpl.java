package achanvear.peru.payments.application.impl;

import achanvear.peru.payments.application.dto.FreelancerWalletSummaryResponse;
import achanvear.peru.payments.application.dto.ProjectPaymentRowResponse;
import achanvear.peru.payments.application.port.in.GetFreelancerWalletSummaryUseCase;
import achanvear.peru.payments.domain.model.CommissionPolicy;
import achanvear.peru.payments.domain.model.MilestoneStatus;
import achanvear.peru.payments.domain.repository.MilestoneRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class GetFreelancerWalletSummaryUseCaseImpl implements GetFreelancerWalletSummaryUseCase {

    private final MilestoneRepository milestoneRepository;

    public GetFreelancerWalletSummaryUseCaseImpl(MilestoneRepository milestoneRepository) {
        this.milestoneRepository = milestoneRepository;
    }

    @Override
    public FreelancerWalletSummaryResponse execute(UUID freelancerUserId) {
        var milestones = milestoneRepository.findByFreelancerUserId(freelancerUserId);
        var formatter = DateTimeFormatter.ISO_INSTANT;

        // Totales
        BigDecimal totalEarned = BigDecimal.ZERO;
        BigDecimal pendingRelease = BigDecimal.ZERO;
        BigDecimal totalPlatformCommissions = BigDecimal.ZERO;
        BigDecimal totalMpCommissions = BigDecimal.ZERO;

        for (var milestone : milestones) {
            if (milestone.getStatus() == MilestoneStatus.RELEASED) {
                totalEarned = totalEarned.add(milestone.getAmount());
                var commission = CommissionPolicy.calculateCommission(milestone.getAmount());
                totalPlatformCommissions = totalPlatformCommissions.add(commission.platformCommission());
                totalMpCommissions = totalMpCommissions.add(commission.mpCommission());
            } else if (milestone.getStatus() == MilestoneStatus.READY_FOR_REVIEW) {
                pendingRelease = pendingRelease.add(milestone.getAmount());
            }
        }

        // Neto disponible = liberado - comisiones
        BigDecimal availableForWithdrawal = totalEarned
                .subtract(totalPlatformCommissions)
                .subtract(totalMpCommissions);

        // Neto total incluyendo pendiente
        BigDecimal netEarnings = availableForWithdrawal.add(
                pendingRelease.multiply(new BigDecimal("0.9087")) // menos ~9.13% comisiones
        );

        // Últimos 5 pagos
        List<ProjectPaymentRowResponse> recentPayments = milestones.stream()
                .filter(m -> m.getStatus() == MilestoneStatus.RELEASED)
                .sorted(Comparator.comparing(m -> m.getReleasedAt(), Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .map(m -> {
                    var commission = CommissionPolicy.calculateCommission(m.getAmount());
                    return new ProjectPaymentRowResponse(
                            m.getProjectId().toString(),
                            "Proyecto " + m.getProjectId().toString().substring(0, 8),
                            m.getId().value().toString(),
                            m.getTitle(),
                            m.getAmount(),
                            commission.platformCommission(),
                            commission.mpCommission(),
                            commission.freelancerAmount(),
                            "RELEASED",
                            m.getReleasedAt() != null ? formatter.format(m.getReleasedAt()) : null
                    );
                })
                .collect(Collectors.toList());

        return new FreelancerWalletSummaryResponse(
                totalEarned,
                pendingRelease,
                availableForWithdrawal,
                totalPlatformCommissions,
                totalMpCommissions,
                netEarnings,
                recentPayments,
                "PEN" // Soles peruanos
        );
    }
}
