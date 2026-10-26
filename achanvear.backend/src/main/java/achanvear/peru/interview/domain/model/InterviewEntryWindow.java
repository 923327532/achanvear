package achanvear.peru.interview.domain.model;

import java.time.LocalDateTime;

public final class InterviewEntryWindow {
    private InterviewEntryWindow() {}
    public static final int GRACE_MINUTES = 30;
    public static boolean expired(LocalDateTime slot, LocalDateTime now) {
        return slot != null && now.isAfter(slot.plusMinutes(GRACE_MINUTES));
    }
    public static void validate(LocalDateTime slot, LocalDateTime now) {
        if (slot == null) throw new IllegalStateException("Debes elegir un horario antes de iniciar");
        if (now.isBefore(slot)) throw new IllegalStateException("Aun no es tu horario. Ingresa desde la hora elegida");
        if (expired(slot, now)) throw new IllegalStateException("Entrevista vencida por inasistencia: superaste los 30 minutos de tolerancia");
    }
}
