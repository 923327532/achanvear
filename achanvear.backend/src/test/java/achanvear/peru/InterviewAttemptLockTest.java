package achanvear.peru;

import achanvear.peru.interview.domain.model.*;
import achanvear.peru.interview.domain.repository.*;
import achanvear.peru.interview.application.impl.*;
import achanvear.peru.interview.application.command.*;
import org.junit.jupiter.api.Test;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class InterviewAttemptLockTest {
    private Interview interview() {
        return new Interview(InterviewId.of(UUID.randomUUID().toString()),UUID.randomUUID().toString(),UUID.randomUUID().toString(),InterviewType.THEORY);
    }
    @Test void abortedAndFailedInterviewsCannotStartOrContactTheAgentAgain() {
        for (boolean aborted:List.of(true,false)) {
            var interview=interview();interview.start();
            if (aborted) interview.abort("Infracciones repetidas");else interview.complete(new InterviewScore(42));
            var repository=mock(InterviewRepository.class);
            when(repository.findById(interview.getId())).thenReturn(Optional.of(interview));
            var agent=mock(achanvear.peru.interview.infrastructure.external.impl.RealAiInterviewerClient.class);
            var consent=mock(achanvear.peru.compliance.application.ValidateInterviewConsentUseCase.class);
            var service=new InterviewApplicationService(repository,mock(achanvear.peru.interview.domain.service.InterviewSlotManager.class),agent,
                    mock(achanvear.peru.interview.infrastructure.external.TextToSpeechClient.class),mock(achanvear.peru.interview.infrastructure.external.S3RecordingClient.class),
                    new achanvear.peru.interview.domain.service.ScoreCalculator(),mock(achanvear.peru.shared.infrastructure.EventPublisher.class),
                    mock(achanvear.peru.jobs.domain.repository.JobPostRepository.class),mock(InterviewScheduleRepository.class),consent,
                    mock(achanvear.peru.interview.infrastructure.persistence.InterviewEvaluationStore.class),mock(InterviewAttendanceService.class));
            assertThrows(IllegalStateException.class,()->service.execute(new StartInterviewSessionCommand(interview.getId().toString())));
            if (aborted) assertThrows(IllegalStateException.class,()->service.execute(new CompleteInterviewCommand(interview.getId().toString(),100,null,null)));
            verifyNoInteractions(agent,consent);
            verify(repository,never()).save(any());
        }
    }
    @Test void aFailedFinalScoreCannotBeReplacedByRepeatedCompletion() {
        var interview=interview();interview.start();interview.complete(new InterviewScore(42));
        interview.complete(new InterviewScore(100));
        assertEquals(42,interview.getScore().getValue());
        assertThrows(IllegalStateException.class,interview::assertCanStart);
    }
    @Test void onlyAScheduledInterviewCanStartANewAttempt() {
        var interview=interview();assertDoesNotThrow(interview::assertCanStart);
        interview.start();assertThrows(IllegalStateException.class,interview::assertCanStart);
        interview.abort("Infracciones");assertThrows(IllegalStateException.class,interview::assertCanStart);
    }
}
