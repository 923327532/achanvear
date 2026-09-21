package achanvear.peru.payments.application.impl;

import achanvear.peru.payments.application.command.ProcessPaymentCommand;
import achanvear.peru.payments.application.port.in.ProcessPaymentUseCase;
import achanvear.peru.payments.application.service.AuditService;
import achanvear.peru.payments.application.service.EscrowService;
import achanvear.peru.payments.domain.model.*;
import achanvear.peru.payments.domain.repository.EscrowRepository;
import achanvear.peru.payments.domain.repository.MilestoneRepository;
import achanvear.peru.payments.domain.repository.PaymentRepository;
import achanvear.peru.payments.infrastructure.external.MercadoPagoGateway;
import achanvear.peru.shared.web.ApiResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ProcessPaymentUseCaseImpl implements ProcessPaymentUseCase {

    private final PaymentRepository paymentRepository;
    private final MilestoneRepository milestoneRepository;
    private final MercadoPagoGateway mercadoPagoGateway;
    private final EscrowService escrowService;
    private final AuditService auditService;

    public ProcessPaymentUseCaseImpl(
            PaymentRepository paymentRepository,
            MilestoneRepository milestoneRepository,
            MercadoPagoGateway mercadoPagoGateway,
            EscrowService escrowService,
            AuditService auditService
    ) {
        this.paymentRepository = paymentRepository;
        this.milestoneRepository = milestoneRepository;
        this.mercadoPagoGateway = mercadoPagoGateway;
        this.escrowService = escrowService;
        this.auditService = auditService;
    }

    @Override
    public ApiResponse<String> execute(ProcessPaymentCommand command) {
        String mpPaymentId = command.mpPaymentId();

        // Paso 1: Verificar duplicado
        if (paymentRepository.existsByMpPaymentId(mpPaymentId)) {
            return ApiResponse.error("Payment already processed");
        }

        // Paso 2: Validar con Mercado Pago
        var mpPayment = mercadoPagoGateway.getPayment(mpPaymentId);
        if (!mpPayment.isApproved()) {
            return ApiResponse.error("Payment not approved");
        }

        // Paso 3: Encontrar milestone asociado
        Milestone milestone = milestoneRepository.findByMpPaymentId(mpPaymentId)
                .orElseThrow(() -> new IllegalStateException("Milestone not found for payment: " + mpPaymentId));

        // Paso 4: Validar monto
        if (mpPayment.transactionAmount().compareTo(milestone.getAmount()) != 0) {
            return ApiResponse.error("Amount mismatch");
        }

        // Paso 5: Crear registro escrow para retener los fondos
        Escrow escrow = escrowService.createEscrow(
                milestone.getId().value(),
                milestone.getProjectId(),
                milestone.getClientUserId(),
                milestone.getFreelancerUserId(),
                milestone.getAmount(),
                mpPaymentId,
                milestone.getMpPreferenceId()
        );

        // Paso 6: Actualizar milestone a FUNDED
        milestone.fund(milestone.getMpPreferenceId(), mpPaymentId);
        milestoneRepository.save(milestone);

        // Paso 7: Registrar auditoría
        auditService.logPaymentFunded(
                milestone.getClientUserId(),
                milestone.getId().value().toString(),
                mpPaymentId,
                null
        );

        return ApiResponse.success("Payment processed and held in escrow", mpPaymentId);
    }
}
