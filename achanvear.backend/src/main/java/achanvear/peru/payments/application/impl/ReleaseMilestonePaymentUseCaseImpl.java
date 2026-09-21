package achanvear.peru.payments.application.impl;

import achanvear.peru.payments.application.command.ReleaseMilestonePaymentCommand;
import achanvear.peru.payments.application.dto.MilestoneReleasedResponse;
import achanvear.peru.payments.application.port.in.ReleaseMilestonePaymentUseCase;
import achanvear.peru.payments.application.service.AuditService;
import achanvear.peru.payments.application.service.EscrowService;
import achanvear.peru.payments.domain.model.*;
import achanvear.peru.payments.domain.repository.MilestoneRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ReleaseMilestonePaymentUseCaseImpl implements ReleaseMilestonePaymentUseCase {

    private final MilestoneRepository milestoneRepository;
    private final EscrowService escrowService;
    private final AuditService auditService;

    public ReleaseMilestonePaymentUseCaseImpl(
            MilestoneRepository milestoneRepository,
            EscrowService escrowService,
            AuditService auditService
    ) {
        this.milestoneRepository = milestoneRepository;
        this.escrowService = escrowService;
        this.auditService = auditService;
    }

    @Override
    public MilestoneReleasedResponse execute(ReleaseMilestonePaymentCommand command) {
        Milestone milestone = milestoneRepository.findById(new MilestoneId(command.milestoneId()))
                .orElseThrow(() -> new IllegalArgumentException("Milestone not found"));

        // Verificar que el cliente sea el dueño
        if (!milestone.getClientUserId().equals(command.clientUserId())) {
            throw new IllegalStateException("Only the client can release the payment");
        }

        // Verificar estado
        if (milestone.getStatus() != MilestoneStatus.READY_FOR_REVIEW) {
            throw new IllegalStateException("Milestone must be in READY_FOR_REVIEW status to release payment");
        }

        // Liberar fondos del escrow (esto actualiza el milestone y el escrow)
        Escrow escrow = escrowService.releaseFunds(command.milestoneId(), command.clientUserId());

        // Calcular comisiones
        var commissionResult = CommissionPolicy.calculateCommission(milestone.getAmount());

        // Registrar auditoría
        auditService.logPaymentReleased(
                command.clientUserId(),
                command.milestoneId().toString(),
                milestone.getAmount().toString(),
                null
        );

        return new MilestoneReleasedResponse(
                milestone.getId().value().toString(),
                milestone.getStatus().name(),
                milestone.getAmount(),
                commissionResult.platformCommission(),
                commissionResult.mpCommission(),
                commissionResult.freelancerAmount(),
                milestone.getReleasedAt().toString()
        );
    }
}
