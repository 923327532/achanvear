package achanvear.peru.hiring.application.impl;

import achanvear.peru.hiring.application.AdvanceCandidateToTheoryInterviewUseCase;
import achanvear.peru.hiring.application.dto.ScreeningResultResponse;
import achanvear.peru.hiring.domain.factory.HiringProcessFactory;
import achanvear.peru.hiring.domain.model.HiringProcess;
import achanvear.peru.hiring.domain.repository.HiringProcessRepository;
import achanvear.peru.shared.application.EventPublisher;
import achanvear.peru.shared.domain.DomainEvent;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AdvanceCandidateToTheoryInterviewService implements AdvanceCandidateToTheoryInterviewUseCase {

    private final HiringProcessRepository hiringProcessRepository;
    private final HiringProcessFactory hiringProcessFactory;
    private final EventPublisher eventPublisher;

    public AdvanceCandidateToTheoryInterviewService(
            HiringProcessRepository hiringProcessRepository,
            HiringProcessFactory hiringProcessFactory,
            EventPublisher eventPublisher
    ) {
        this.hiringProcessRepository = hiringProcessRepository;
        this.hiringProcessFactory = hiringProcessFactory;
        this.eventPublisher = eventPublisher;
    }

    @Override
    public ScreeningResultResponse execute(
            String jobId,
            String candidateId,
            Double screeningScore,
            String summary
    ) {
        var existing = hiringProcessRepository.findByJobIdAndCandidateId(jobId, candidateId);
        if (existing.isPresent()) {
            HiringProcess process = existing.get();
            if (process.getStage() == achanvear.peru.hiring.domain.model.HiringStage.REJECTED) {
                throw new IllegalStateException("A rejected candidate cannot be advanced to an interview");
            }
            return ScreeningResultResponse.from(process, screeningScore, true, summary);
        }

        HiringProcess process = hiringProcessFactory.create(jobId, candidateId);
        process.startScreening();
        process.completeScreening(true, screeningScore, summary);
        hiringProcessRepository.save(process);
        for (DomainEvent event : process.pullDomainEvents()) {
            eventPublisher.publish(event);
        }
        return ScreeningResultResponse.from(process, screeningScore, true, summary);
    }
}
