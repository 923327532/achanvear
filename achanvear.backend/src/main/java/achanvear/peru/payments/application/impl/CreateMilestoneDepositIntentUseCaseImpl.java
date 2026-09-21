package achanvear.peru.payments.application.impl;

import achanvear.peru.payments.application.command.CreateMilestoneDepositIntentCommand;
import achanvear.peru.payments.application.dto.MilestoneDepositIntentResponse;
import achanvear.peru.payments.application.port.in.CreateMilestoneDepositIntentUseCase;
import achanvear.peru.payments.application.service.AuditService;
import achanvear.peru.payments.application.service.FraudDetectionService;
import achanvear.peru.payments.domain.model.Milestone;
import achanvear.peru.payments.domain.model.MilestoneStatus;
import achanvear.peru.payments.domain.repository.MilestoneRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CreateMilestoneDepositIntentUseCaseImpl implements CreateMilestoneDepositIntentUseCase {

    private final MilestoneRepository milestoneRepository;
    private final FraudDetectionService fraudDetectionService;
    private final AuditService auditService;

    public CreateMilestoneDepositIntentUseCaseImpl(
            MilestoneRepository milestoneRepository,
            FraudDetectionService fraudDetectionService,
            AuditService auditService
    ) {
        this.milestoneRepository = milestoneRepository;
        this.fraudDetectionService = fraudDetectionService;
        this.auditService = auditService;
    }

    @Override
    public MilestoneDepositIntentResponse execute(CreateMilestoneDepositIntentCommand command) {
        var fraudAssessment = fraudDetectionService.assessTransaction(
                command.clientUserId(),
                command.freelancerUserId(),
                command.amount(),
                command.ipAddress(),
                command.userAgent()
        );

        if (fraudAssessment.isBlocked()) {
            auditService.logFraudAlert(
                    command.clientUserId(),
                    null,
                    fraudAssessment.riskScore(),
                    String.join(", ", fraudAssessment.riskFactors()),
                    command.ipAddress()
            );
            throw new SecurityException("Transaction blocked by fraud detection. Risk score: " + fraudAssessment.riskScore());
        }

        Milestone milestone = Milestone.create(
                command.projectId(),
                command.clientUserId(),
                command.freelancerUserId(),
                command.title(),
                command.description(),
                command.amount()
        );

        milestoneRepository.save(milestone);

        auditService.logPaymentCreated(
                command.clientUserId(),
                milestone.getId().value().toString(),
                command.amount().toString(),
                command.ipAddress()
        );

        if (fraudAssessment.requiresReview()) {
            auditService.logFraudAlert(
                    command.clientUserId(),
                    milestone.getId().value().toString(),
                    fraudAssessment.riskScore(),
                    String.join(", ", fraudAssessment.riskFactors()),
                    command.ipAddress()
            );
        }

        return new MilestoneDepositIntentResponse(
                milestone.getId().value().toString(),
                milestone.getId().value().toString(),
                null,
                null,
                MilestoneStatus.PENDING.name()
        );
    }
}
