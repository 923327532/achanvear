package achanvear.peru.hiring.application.impl;

import achanvear.peru.hiring.application.EvaluateTheoryResultUseCase;
import achanvear.peru.hiring.application.GenerateFinalReportUseCase;
import achanvear.peru.hiring.application.StartScreeningUseCase;
import achanvear.peru.hiring.application.command.EvaluateTheoryResultCommand;
import achanvear.peru.hiring.application.command.StartScreeningCommand;
import achanvear.peru.hiring.application.dto.HiringReportResponse;
import achanvear.peru.hiring.application.dto.ScreeningResultResponse;
import achanvear.peru.hiring.domain.factory.HiringProcessFactory;
import achanvear.peru.hiring.domain.model.HiringProcess;
import achanvear.peru.hiring.domain.model.HiringProcessId;
import achanvear.peru.hiring.domain.model.ScreeningResult;
import achanvear.peru.hiring.domain.repository.HiringProcessRepository;
import achanvear.peru.hiring.infrastructure.external.AiScreeningClient;
import achanvear.peru.shared.application.EventPublisher;
import achanvear.peru.shared.domain.DomainEvent;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class HiringApplicationService implements
        StartScreeningUseCase,
        EvaluateTheoryResultUseCase,
        GenerateFinalReportUseCase {

    private final HiringProcessRepository hiringProcessRepository;
    private final HiringProcessFactory hiringProcessFactory;
    private final AiScreeningClient aiScreeningClient;
    private final EventPublisher eventPublisher;

    public HiringApplicationService(
            HiringProcessRepository hiringProcessRepository,
            HiringProcessFactory hiringProcessFactory,
            AiScreeningClient aiScreeningClient,
            EventPublisher eventPublisher
    ) {
        this.hiringProcessRepository = hiringProcessRepository;
        this.hiringProcessFactory = hiringProcessFactory;
        this.aiScreeningClient = aiScreeningClient;
        this.eventPublisher = eventPublisher;
    }

    @Override
    public ScreeningResultResponse execute(StartScreeningCommand command) {
        HiringProcess hiringProcess = hiringProcessFactory.create(
                command.jobId(),
                command.candidateId()
        );

        hiringProcess.startScreening();

        ScreeningResult screeningResult = aiScreeningClient.evaluate(command);

        hiringProcess.completeScreening(
                screeningResult.isSelected(),
                screeningResult.getScore(),
                screeningResult.getSummary()
        );

        hiringProcessRepository.save(hiringProcess);
        publishDomainEvents(hiringProcess);

        return ScreeningResultResponse.from(
                hiringProcess,
                screeningResult.getScore(),
                screeningResult.getSummary()
        );
    }

    @Override
    public ScreeningResultResponse execute(EvaluateTheoryResultCommand command) {
        HiringProcess hiringProcess = hiringProcessRepository.findById(HiringProcessId.of(command.hiringProcessId()))
                .orElseThrow(() -> new IllegalArgumentException("Hiring process not found"));

        hiringProcess.registerTheoryInterviewResult(command.theoryScore());

        hiringProcessRepository.save(hiringProcess);
        publishDomainEvents(hiringProcess);

        return ScreeningResultResponse.from(hiringProcess);
    }

    @Override
    @Transactional(readOnly = true)
    public HiringReportResponse execute(String jobId) {
        return new HiringReportResponse(
                jobId,
                "PENDING",
                "Final report generation will be connected to AI report service"
        );
    }

    private void publishDomainEvents(HiringProcess hiringProcess) {
        for (DomainEvent event : hiringProcess.pullDomainEvents()) {
            eventPublisher.publish(event);
        }
    }

}