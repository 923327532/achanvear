package achanvear.peru.interview.application.impl;

import achanvear.peru.interview.application.RealtimeInterviewSessionUseCase;
import achanvear.peru.interview.domain.service.InterviewSlotManager;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class RealtimeInterviewSessionService implements RealtimeInterviewSessionUseCase {

    private final InterviewSlotManager slotManager;

    public RealtimeInterviewSessionService(InterviewSlotManager slotManager) {
        this.slotManager = slotManager;
    }

    @Override
    public void openSession(String interviewId) {
        slotManager.acquireSlot(interviewId)
                .orElseThrow(() -> new IllegalStateException("No interview slots available"));
    }

    @Override
    public void closeSession(String interviewId) {
        slotManager.releaseSlot(interviewId);
    }

    @Override
    public void disconnectSession(String interviewId) {
        slotManager.releaseSlot(interviewId);
    }
}
