package achanvear.peru.interview.application.impl;

import achanvear.peru.interview.application.port.AbandonedInterviewCleanupPort;
import achanvear.peru.interview.domain.service.InterviewSlotManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.Clock;
import java.time.Duration;

@Service
public class AbandonedInterviewCleanupService {
    private final AbandonedInterviewCleanupPort cleanup;
    private final InterviewSlotManager slots;
    private final Clock clock;

    @Autowired
    public AbandonedInterviewCleanupService(AbandonedInterviewCleanupPort cleanup, InterviewSlotManager slots) {
        this(cleanup, slots, Clock.systemUTC());
    }

    public AbandonedInterviewCleanupService(AbandonedInterviewCleanupPort cleanup, InterviewSlotManager slots, Clock clock) {
        this.cleanup = cleanup;
        this.slots = slots;
        this.clock = clock;
    }

    @Scheduled(fixedDelayString = "${interviews.abandoned-check-ms:60000}")
    public void closeAbandoned() {
        cleanup.closeInactiveBefore(clock.instant().minus(Duration.ofHours(24)))
                .forEach(slots::releaseSlot);
    }
}
