package achanvear.peru.payments.application.service;

import achanvear.peru.payments.domain.model.Escrow;
import achanvear.peru.payments.domain.model.EscrowStatus;
import achanvear.peru.payments.domain.repository.EscrowRepository;
import achanvear.peru.payments.infrastructure.external.MercadoPagoGateway;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Servicio para manejar reembolsos a través de Mercado Pago.
 */
@Service
public class RefundService {

    private final EscrowRepository escrowRepository;
    private final EscrowService escrowService;
    private final MercadoPagoGateway mercadoPagoGateway;
    private final AuditService auditService;

    public RefundService(
            EscrowRepository escrowRepository,
            EscrowService escrowService,
            MercadoPagoGateway mercadoPagoGateway,
            AuditService auditService
    ) {
        this.escrowRepository = escrowRepository;
        this.escrowService = escrowService;
        this.mercadoPagoGateway = mercadoPagoGateway;
        this.auditService = auditService;
    }

    /**
     * Procesa un reembolso completo al cliente.
     * Primero intenta el reembolso en MP, luego actualiza el estado interno.
     */
    @Transactional
    public Escrow processRefund(UUID milestoneId, String reason) {
        Escrow escrow = escrowRepository.findByMilestoneId(milestoneId)
                .orElseThrow(() -> new IllegalArgumentException("Escrow not found for milestone: " + milestoneId));

        if (escrow.getStatus() != EscrowStatus.HELD && escrow.getStatus() != EscrowStatus.DISPUTED) {
            throw new IllegalStateException("Escrow must be HELD or DISPUTED to refund");
        }

        // Intentar reembolso en Mercado Pago
        if (escrow.getMpPaymentId() != null) {
            try {
                mercadoPagoGateway.refundPayment(escrow.getMpPaymentId(), escrow.getAmount());
            } catch (Exception e) {
                throw new RuntimeException("Failed to process refund in Mercado Pago: " + e.getMessage(), e);
            }
        }

        // Actualizar estado interno
        Escrow refundedEscrow = escrowService.refundFunds(milestoneId, reason);
        return refundedEscrow;
    }

    /**
     * Procesa un reembolso parcial (solo la comisión de plataforma).
     */
    @Transactional
    public Escrow processPartialRefund(UUID milestoneId, BigDecimal amount, String reason) {
        Escrow escrow = escrowRepository.findByMilestoneId(milestoneId)
                .orElseThrow(() -> new IllegalArgumentException("Escrow not found for milestone: " + milestoneId));

        if (escrow.getStatus() != EscrowStatus.HELD) {
            throw new IllegalStateException("Escrow must be HELD for partial refund");
        }

        if (amount.compareTo(escrow.getAmount()) > 0) {
            throw new IllegalArgumentException("Partial refund amount cannot exceed escrow amount");
        }

        // Intentar reembolso parcial en Mercado Pago
        if (escrow.getMpPaymentId() != null) {
            try {
                mercadoPagoGateway.refundPayment(escrow.getMpPaymentId(), amount);
            } catch (Exception e) {
                throw new RuntimeException("Failed to process partial refund in Mercado Pago: " + e.getMessage(), e);
            }
        }

        auditService.logPaymentRefunded(escrow.getClientUserId(), milestoneId.toString(),
                "Partial refund: " + reason, null);

        return escrow;
    }
}
