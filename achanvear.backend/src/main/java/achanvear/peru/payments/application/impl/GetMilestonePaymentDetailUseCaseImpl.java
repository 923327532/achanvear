package achanvear.peru.payments.application.impl;

import achanvear.peru.payments.application.dto.MilestonePaymentDetailResponse;
import achanvear.peru.payments.application.port.in.GetMilestonePaymentDetailUseCase;
import achanvear.peru.payments.domain.model.MilestoneId;
import achanvear.peru.payments.domain.model.MilestoneStatus;
import achanvear.peru.payments.domain.repository.MilestoneRepository;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class GetMilestonePaymentDetailUseCaseImpl implements GetMilestonePaymentDetailUseCase {

    private final MilestoneRepository milestoneRepository;

    public GetMilestonePaymentDetailUseCaseImpl(MilestoneRepository milestoneRepository) {
        this.milestoneRepository = milestoneRepository;
    }

    @Override
    public MilestonePaymentDetailResponse execute(UUID milestoneId) {
        var milestone = milestoneRepository.findById(new MilestoneId(milestoneId))
                .orElseThrow(() -> new IllegalArgumentException("Milestone not found: " + milestoneId));

        String nextAction = getNextAction(milestone.getStatus());
        var formatter = DateTimeFormatter.ISO_INSTANT;

        return new MilestonePaymentDetailResponse(
                milestone.getId().value().toString(),
                milestone.getProjectId().toString(),
                milestone.getTitle(),
                milestone.getDescription(),
                milestone.getAmount(),
                milestone.getStatus().name(),
                milestone.getFreelancerUserId().toString(),
                milestone.getClientUserId().toString(),
                milestone.getFundedAt() != null ? formatter.format(milestone.getFundedAt()) : null,
                milestone.getReleasedAt() != null ? formatter.format(milestone.getReleasedAt()) : null,
                milestone.getMpPaymentId(),
                nextAction
        );
    }

    private String getNextAction(MilestoneStatus status) {
        return switch (status) {
            case PENDING -> "Esperando depósito del cliente";
            case FUNDED -> "Dinero retenido. Freelancer puede comenzar a trabajar.";
            case IN_PROGRESS -> "Freelancer trabajando. Debe subir entrega cuando termine.";
            case READY_FOR_REVIEW -> "Trabajo entregado. Cliente debe revisar y liberar pago.";
            case RELEASED -> "Pago completado. Dinero transferido al freelancer.";
            case DISPUTED -> "Disputa en curso. Esperando resolución.";
            case REFUNDED -> "Dinero devuelto al cliente.";
        };
    }
}
