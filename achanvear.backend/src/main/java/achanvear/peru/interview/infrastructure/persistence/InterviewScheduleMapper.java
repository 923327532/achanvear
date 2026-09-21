package achanvear.peru.interview.infrastructure.persistence;

import achanvear.peru.interview.domain.model.*;
import achanvear.peru.interview.infrastructure.persistence.entity.InterviewScheduleJpaEntity;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class InterviewScheduleMapper {

    public InterviewScheduleJpaEntity toEntity(InterviewSchedule schedule) {
        InterviewScheduleJpaEntity entity = new InterviewScheduleJpaEntity();
        entity.setId(schedule.getId());
        entity.setHiringProcessId(schedule.getHiringProcessId());
        entity.setCandidateId(schedule.getCandidateId());
        entity.setJobId(schedule.getJobId());
        entity.setInterviewType(schedule.getInterviewType().name());
        entity.setStatus(schedule.getStatus().name());
        entity.setTokenStatus(schedule.getTokenStatus().name());
        entity.setInterviewToken(schedule.getInterviewToken());

        // Mapear slots
        List<InterviewSlot> slots = schedule.getProposedSlots();
        if (slots.size() > 0) {
            entity.setSlot1DateTime(slots.get(0).getDateTime().toString());
            entity.setSlot1Status(slots.get(0).getStatus().name());
        }
        if (slots.size() > 1) {
            entity.setSlot2DateTime(slots.get(1).getDateTime().toString());
            entity.setSlot2Status(slots.get(1).getStatus().name());
        }
        if (slots.size() > 2) {
            entity.setSlot3DateTime(slots.get(2).getDateTime().toString());
            entity.setSlot3Status(slots.get(2).getStatus().name());
        }

        // Mapear slot elegido
        if (schedule.getChosenSlot() != null) {
            entity.setChosenDateTime(schedule.getChosenSlot().getDateTime().toString());
            entity.setChosenSlotIndex(schedule.getProposedSlots().indexOf(schedule.getChosenSlot()));
        }

        return entity;
    }

    public InterviewSchedule toDomain(InterviewScheduleJpaEntity entity) {
        List<InterviewSlot> slots = List.of(
                new InterviewSlot(
                        LocalDateTime.parse(entity.getSlot1DateTime()),
                        InterviewSlot.SlotStatus.valueOf(entity.getSlot1Status())
                ),
                new InterviewSlot(
                        LocalDateTime.parse(entity.getSlot2DateTime()),
                        InterviewSlot.SlotStatus.valueOf(entity.getSlot2Status())
                ),
                new InterviewSlot(
                        LocalDateTime.parse(entity.getSlot3DateTime()),
                        InterviewSlot.SlotStatus.valueOf(entity.getSlot3Status())
                )
        );

        InterviewSlot chosenSlot = null;
        if (entity.getChosenSlotIndex() != null && entity.getChosenDateTime() != null) {
            chosenSlot = new InterviewSlot(
                    LocalDateTime.parse(entity.getChosenDateTime()),
                    InterviewSlot.SlotStatus.RESERVED
            );
        }

        return InterviewSchedule.restore(
                entity.getId(),
                entity.getHiringProcessId(),
                entity.getCandidateId(),
                entity.getJobId(),
                InterviewType.valueOf(entity.getInterviewType()),
                slots,
                chosenSlot,
                entity.getInterviewToken(),
                entity.getTokenStatus() != null ? InterviewTokenStatus.valueOf(entity.getTokenStatus()) : InterviewTokenStatus.PENDING,
                InterviewScheduleStatus.valueOf(entity.getStatus())
        );
    }
}
