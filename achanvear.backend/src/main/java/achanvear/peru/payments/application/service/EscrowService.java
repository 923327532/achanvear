package achanvear.peru.payments.application.service;

import achanvear.peru.payments.domain.model.*;
import achanvear.peru.payments.domain.repository.EscrowRepository;
import achanvear.peru.payments.domain.repository.MilestoneRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Servicio central del sistema escrow.
 * Maneja la retención, liberación y reembolso de fondos.
 */
@Service
public class EscrowService {

    private final EscrowRepository escrowRepository;
    private final MilestoneRepository milestoneRepository;
    private final AuditService auditService;

    public EscrowService(
            EscrowRepository escrowRepository,
            MilestoneRepository milestoneRepository,
            AuditService auditService
    ) {
        this.escrowRepository = escrowRepository;
        this.milestoneRepository = milestoneRepository;
        this.auditService = auditService;
    }

    /**
     * Crea un registro escrow cuando el cliente deposita fondos.
     */
    @Transactional
    public Escrow createEscrow(
            UUID milestoneId,
            UUID projectId,
            UUID clientUserId,
            UUID freelancerUserId,
            BigDecimal amount,
            String mpPaymentId,
            String mpPreferenceId
    ) {
        Escrow escrow = Escrow.create(
                milestoneId,
                projectId,
                clientUserId,
                freelancerUserId,
                amount,
                mpPaymentId,
                mpPreferenceId
        );
        escrowRepository.save(escrow);
        return escrow;
    }

    /**
     * Libera los fondos retenidos al freelancer cuando el cliente confirma.
     */
    @Transactional
    public Escrow releaseFunds(UUID milestoneId, UUID clientUserId) {
        Escrow escrow = escrowRepository.findByMilestoneId(milestoneId)
                .orElseThrow(() -> new IllegalArgumentException("Escrow not found for milestone: " + milestoneId));

        if (!escrow.getClientUserId().equals(clientUserId)) {
            throw new SecurityException("Only the client can release funds");
        }

        escrow.release();
        escrowRepository.save(escrow);

        // Actualizar milestone
        var milestone = milestoneRepository.findById(new MilestoneId(milestoneId))
                .orElseThrow(() -> new IllegalArgumentException("Milestone not found: " + milestoneId));
        milestone.markAsReleased();
        milestoneRepository.save(milestone);

        auditService.logPaymentReleased(clientUserId, milestoneId.toString(),
                escrow.getFreelancerAmount().toString(), null);

        return escrow;
    }

    /**
     * Reembolsa los fondos al cliente.
     */
    @Transactional
    public Escrow refundFunds(UUID milestoneId, String reason) {
        Escrow escrow = escrowRepository.findByMilestoneId(milestoneId)
                .orElseThrow(() -> new IllegalArgumentException("Escrow not found for milestone: " + milestoneId));

        escrow.refund(reason);
        escrowRepository.save(escrow);

        // Actualizar milestone
        var milestone = milestoneRepository.findById(new MilestoneId(milestoneId))
                .orElseThrow(() -> new IllegalArgumentException("Milestone not found: " + milestoneId));
        milestone.markAsRefunded();
        milestoneRepository.save(milestone);

        auditService.logPaymentRefunded(escrow.getClientUserId(), milestoneId.toString(), reason, null);

        return escrow;
    }

    /**
     * Marca el escrow como en disputa.
     */
    @Transactional
    public Escrow disputeFunds(UUID milestoneId, String reason) {
        Escrow escrow = escrowRepository.findByMilestoneId(milestoneId)
                .orElseThrow(() -> new IllegalArgumentException("Escrow not found for milestone: " + milestoneId));

        escrow.dispute(reason);
        escrowRepository.save(escrow);

        // Actualizar milestone
        var milestone = milestoneRepository.findById(new MilestoneId(milestoneId))
                .orElseThrow(() -> new IllegalArgumentException("Milestone not found: " + milestoneId));
        milestone.markAsDisputed();
        milestoneRepository.save(milestone);

        auditService.logDisputeOpened(escrow.getClientUserId(), milestoneId.toString(), reason, null);

        return escrow;
    }

    /**
     * Resuelve una disputa y libera o reembolsa según la decisión.
     */
    @Transactional
    public Escrow resolveDispute(UUID milestoneId, String resolution, boolean releaseToFreelancer) {
        Escrow escrow = escrowRepository.findByMilestoneId(milestoneId)
                .orElseThrow(() -> new IllegalArgumentException("Escrow not found for milestone: " + milestoneId));

        escrow.resolveDispute(resolution, releaseToFreelancer);
        escrowRepository.save(escrow);

        // Actualizar milestone
        var milestone = milestoneRepository.findById(new MilestoneId(milestoneId))
                .orElseThrow(() -> new IllegalArgumentException("Milestone not found: " + milestoneId));
        if (releaseToFreelancer) {
            milestone.markAsReleased();
        } else {
            milestone.markAsRefunded();
        }
        milestoneRepository.save(milestone);

        auditService.logDisputeResolved(escrow.getClientUserId(), milestoneId.toString(), resolution, null);

        return escrow;
    }

    /**
     * Obtiene el estado del escrow para un milestone.
     */
    public Escrow getEscrowByMilestone(UUID milestoneId) {
        return escrowRepository.findByMilestoneId(milestoneId)
                .orElseThrow(() -> new IllegalArgumentException("Escrow not found for milestone: " + milestoneId));
    }
}
