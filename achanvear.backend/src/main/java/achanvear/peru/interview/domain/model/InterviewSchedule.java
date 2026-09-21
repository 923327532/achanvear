package achanvear.peru.interview.domain.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

/**
 * Entidad raiz del agregado InterviewSchedule.
 * Representa la agenda de una entrevista con 3 horarios propuestos,
 * el horario elegido por el candidato y un token de un solo uso.
 */
public class InterviewSchedule {

    private final String id;
    private final String hiringProcessId;
    private final String candidateId;
    private final String jobId;
    private final InterviewType interviewType;
    private final List<InterviewSlot> proposedSlots;
    private InterviewSlot chosenSlot;
    private String interviewToken;
    private InterviewTokenStatus tokenStatus;
    private InterviewScheduleStatus status;

    public InterviewSchedule(
            String id,
            String hiringProcessId,
            String candidateId,
            String jobId,
            InterviewType interviewType,
            List<InterviewSlot> proposedSlots
    ) {
        this.id = Objects.requireNonNull(id, "id cannot be null");
        this.hiringProcessId = Objects.requireNonNull(hiringProcessId, "hiringProcessId cannot be null");
        this.candidateId = Objects.requireNonNull(candidateId, "candidateId cannot be null");
        this.jobId = Objects.requireNonNull(jobId, "jobId cannot be null");
        this.interviewType = Objects.requireNonNull(interviewType, "interviewType cannot be null");
        this.proposedSlots = new ArrayList<>(Objects.requireNonNull(proposedSlots, "proposedSlots cannot be null"));

        if (proposedSlots.size() != 3) {
            throw new IllegalArgumentException("Must provide exactly 3 proposed slots");
        }

        this.status = InterviewScheduleStatus.PENDING_SELECTION;
        this.tokenStatus = InterviewTokenStatus.PENDING;
    }

    /**
     * Factory method para restaurar desde persistencia.
     */
    public static InterviewSchedule restore(
            String id,
            String hiringProcessId,
            String candidateId,
            String jobId,
            InterviewType interviewType,
            List<InterviewSlot> proposedSlots,
            InterviewSlot chosenSlot,
            String interviewToken,
            InterviewTokenStatus tokenStatus,
            InterviewScheduleStatus status
    ) {
        InterviewSchedule schedule = new InterviewSchedule(id, hiringProcessId, candidateId, jobId, interviewType, proposedSlots);
        schedule.chosenSlot = chosenSlot;
        schedule.interviewToken = interviewToken;
        schedule.tokenStatus = tokenStatus != null ? tokenStatus : InterviewTokenStatus.PENDING;
        schedule.status = status != null ? status : InterviewScheduleStatus.PENDING_SELECTION;
        return schedule;
    }

    /**
     * El candidato elige un horario de los 3 propuestos.
     * @param slotIndex indice del horario (0, 1 o 2)
     * @throws IllegalStateException si ya eligio antes o el indice es invalido
     */
    public void chooseSlot(int slotIndex) {
        if (status != InterviewScheduleStatus.PENDING_SELECTION) {
            throw new IllegalStateException("Slot already chosen for schedule " + id);
        }

        if (slotIndex < 0 || slotIndex >= proposedSlots.size()) {
            throw new IllegalArgumentException("Invalid slot index: " + slotIndex + ". Must be 0, 1 or 2");
        }

        InterviewSlot selected = proposedSlots.get(slotIndex);
        if (selected.getStatus() != InterviewSlot.SlotStatus.AVAILABLE) {
            throw new IllegalStateException("Slot " + slotIndex + " is not available");
        }

        // Marcar slot como reservado
        this.chosenSlot = selected.withStatus(InterviewSlot.SlotStatus.RESERVED);
        this.proposedSlots.set(slotIndex, this.chosenSlot);

        // Generar token de un solo uso
        this.interviewToken = UUID.randomUUID().toString();
        this.tokenStatus = InterviewTokenStatus.ACTIVE;
        this.status = InterviewScheduleStatus.RESERVED;
    }

    /**
     * Valida que el token sea valido y que el candidato pueda entrar a la entrevista.
     * @param now momento actual para validar ventana de tiempo
     * @return true si puede entrar, false si no
     * @throws IllegalStateException con mensaje especifico segun la regla violada
     */
    public boolean validateEntry(LocalDateTime now) {
        if (tokenStatus == InterviewTokenStatus.USED) {
            throw new IllegalStateException("Este enlace ya fue utilizado");
        }

        if (tokenStatus == InterviewTokenStatus.EXPIRED) {
            throw new IllegalStateException("Enlace expirado, fuiste descalificado");
        }

        if (chosenSlot == null) {
            throw new IllegalStateException("No slot has been chosen yet");
        }

        LocalDateTime slotTime = chosenSlot.getDateTime();
        LocalDateTime fiveMinutesBefore = slotTime.minusMinutes(5);
        LocalDateTime fiveMinutesAfter = slotTime.plusMinutes(5);

        if (now.isBefore(fiveMinutesBefore)) {
            throw new IllegalStateException("Aun no es tu horario, puedes entrar 5 minutos antes");
        }

        if (now.isAfter(fiveMinutesAfter)) {
            // Marcar como expirado y no-show
            this.tokenStatus = InterviewTokenStatus.EXPIRED;
            this.status = InterviewScheduleStatus.NO_SHOW;
            throw new IllegalStateException("Tiempo de acceso expirado, descalificado por tardanza");
        }

        // Todo valido: marcar token como usado
        this.tokenStatus = InterviewTokenStatus.USED;
        this.status = InterviewScheduleStatus.COMPLETED;
        return true;
    }

    // Getters

    public String getId() {
        return id;
    }

    public String getHiringProcessId() {
        return hiringProcessId;
    }

    public String getCandidateId() {
        return candidateId;
    }

    public String getJobId() {
        return jobId;
    }

    public InterviewType getInterviewType() {
        return interviewType;
    }

    public List<InterviewSlot> getProposedSlots() {
        return Collections.unmodifiableList(proposedSlots);
    }

    public InterviewSlot getChosenSlot() {
        return chosenSlot;
    }

    public String getInterviewToken() {
        return interviewToken;
    }

    public InterviewTokenStatus getTokenStatus() {
        return tokenStatus;
    }

    public InterviewScheduleStatus getStatus() {
        return status;
    }
}
