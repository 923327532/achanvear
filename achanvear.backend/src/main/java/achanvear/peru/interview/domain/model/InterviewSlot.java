package achanvear.peru.interview.domain.model;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Value object que representa un horario propuesto para entrevista.
 */
public class InterviewSlot {

    private final LocalDateTime dateTime;
    private final SlotStatus status;

    public InterviewSlot(LocalDateTime dateTime, SlotStatus status) {
        this.dateTime = Objects.requireNonNull(dateTime, "Slot dateTime cannot be null");
        this.status = Objects.requireNonNull(status, "Slot status cannot be null");
    }

    public LocalDateTime getDateTime() {
        return dateTime;
    }

    public SlotStatus getStatus() {
        return status;
    }

    public InterviewSlot withStatus(SlotStatus newStatus) {
        return new InterviewSlot(this.dateTime, newStatus);
    }

    public enum SlotStatus {
        AVAILABLE,
        RESERVED
    }
}
