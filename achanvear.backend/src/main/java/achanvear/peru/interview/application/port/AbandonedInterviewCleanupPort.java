package achanvear.peru.interview.application.port;

import java.time.Instant;
import java.util.List;

public interface AbandonedInterviewCleanupPort {
    List<String> closeInactiveBefore(Instant cutoff);
}
