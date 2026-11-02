package achanvear.peru;

import achanvear.peru.interview.application.impl.AbandonedInterviewCleanupService;
import achanvear.peru.interview.application.port.AbandonedInterviewCleanupPort;
import achanvear.peru.interview.domain.service.InterviewSlotManager;
import org.junit.jupiter.api.Test;
import java.time.*;
import java.util.List;
import static org.mockito.Mockito.*;

class AbandonedInterviewCleanupTest {
    @Test void closesOnlyStaleSessionsAndReleasesTheirSlotsUsingUtc() {
        var now = Instant.parse("2026-11-02T04:00:00Z");
        var cleanup = mock(AbandonedInterviewCleanupPort.class);
        var slots = mock(InterviewSlotManager.class);
        when(cleanup.closeInactiveBefore(now.minus(Duration.ofHours(24)))).thenReturn(List.of("abandoned"));
        new AbandonedInterviewCleanupService(cleanup, slots, Clock.fixed(now, ZoneOffset.UTC)).closeAbandoned();
        verify(cleanup).closeInactiveBefore(now.minus(Duration.ofHours(24)));
        verify(slots).releaseSlot("abandoned");
        verifyNoMoreInteractions(slots);
    }
}
