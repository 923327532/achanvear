package achanvear.peru.hiring.infrastructure.event;

import achanvear.peru.interview.domain.event.InterviewCompletedEvent;
import achanvear.peru.interview.domain.repository.InterviewRepository;
import achanvear.peru.hiring.domain.repository.HiringProcessRepository;
import achanvear.peru.hiring.domain.model.*;
import achanvear.peru.jobs.domain.repository.ApplicationRepository;
import achanvear.peru.jobs.domain.model.ApplicationStatus;
import achanvear.peru.shared.application.EventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Component
public class InterviewResultHandler {
    private final InterviewRepository interviews;
    private final HiringProcessRepository processes;
    private final ApplicationRepository applications;
    private final EventPublisher publisher;
    public InterviewResultHandler(InterviewRepository interviews, HiringProcessRepository processes,
                                  ApplicationRepository applications, EventPublisher publisher) {
        this.interviews = interviews; this.processes = processes;
        this.applications = applications; this.publisher = publisher;
    }
    @EventListener
    @Transactional
    public void completed(InterviewCompletedEvent event) {
        var interview = interviews.findById(event.interviewId()).orElseThrow();
        var process = processes.findByJobIdAndCandidateId(interview.getJobId(), interview.getCandidateId())
                .or(() -> processes.findById(HiringProcessId.of(interview.getHiringProcessId())))
                .orElseThrow(() -> new IllegalStateException("Hiring process not found for interview"));
        boolean theory = "THEORY".equals(event.interviewType());
        HiringStage expected = theory ? HiringStage.THEORY_INTERVIEW : HiringStage.TECHNICAL_INTERVIEW;
        var application = applications.findByCandidateUserId(UUID.fromString(process.getCandidateId())).stream()
                .filter(a -> a.getJobPostId().toString().equals(process.getJobId())).findFirst().orElseThrow();
        int score = interview.getScore().getValue();
        boolean scoreChanged = !java.util.Objects.equals(theory ? application.getTheoryScore() : application.getTechnicalScore(), score);
        if (theory) application.registerTheoryScore(score);
        else application.registerTechnicalScore(score);
        if (process.getStage() != expected) {
            if (scoreChanged) applications.save(application);
            return; // preserve results even after a manual stage change
        }
        if (theory) {
            process.registerTheoryInterviewResult(score);
            application.registerTheoryScore(score);
        } else {
            process.registerTechnicalInterviewResult(score, score >= 75);
            application.registerTechnicalScore(score);
        }
        if (process.getStage() == HiringStage.REJECTED && application.getStatus() != ApplicationStatus.REJECTED) {
            application.changeStatus(ApplicationStatus.REJECTED);
        }
        applications.save(application);
        processes.save(process);
        for (var e : process.pullDomainEvents()) publisher.publish(e);
    }
}
