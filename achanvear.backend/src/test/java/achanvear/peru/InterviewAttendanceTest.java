package achanvear.peru;

import achanvear.peru.interview.domain.model.*;
import achanvear.peru.interview.domain.repository.*;
import achanvear.peru.interview.application.impl.InterviewAttendanceService;
import org.junit.jupiter.api.Test;
import java.time.*;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class InterviewAttendanceTest {
    @Test void chosenSlotIndexSurvivesPersistenceRoundTrip() {
        var mapper = new achanvear.peru.interview.infrastructure.persistence.InterviewScheduleMapper();
        var restored = mapper.toDomain(mapper.toEntity(schedule(time)));
        assertEquals(0, mapper.toEntity(restored).getChosenSlotIndex());
        assertEquals(time.toString(), mapper.toEntity(restored).getChosenDateTime());
    }
    private final LocalDateTime time=LocalDateTime.of(2030,1,10,15,0);
    private InterviewSchedule schedule(LocalDateTime slot) {
        var chosen=new InterviewSlot(slot,InterviewSlot.SlotStatus.RESERVED);
        return InterviewSchedule.restore("schedule","process","candidate","job",InterviewType.TECHNICAL,
                List.of(chosen,new InterviewSlot(slot.plusDays(1),InterviewSlot.SlotStatus.AVAILABLE),new InterviewSlot(slot.plusDays(2),InterviewSlot.SlotStatus.AVAILABLE)),
                chosen,"token",InterviewTokenStatus.ACTIVE,InterviewScheduleStatus.RESERVED);
    }
    @Test void cannotEnterEarlyAndChosenTimeIsPreserved() {
        var schedule=schedule(time);
        assertThrows(IllegalStateException.class,()->schedule.validateEntry(time.minusNanos(1)));
        assertEquals(time,schedule.getChosenSlot().getDateTime());
        assertEquals(InterviewScheduleStatus.RESERVED,schedule.getStatus());
    }
    @Test void canEnterAtTheExactHourOrUpToThirtyMinutesInclusive() {
        for (var entry:List.of(time,time.plusMinutes(5),time.plusMinutes(29),time.plusMinutes(30))) {
            var schedule=schedule(time);
            assertTrue(schedule.validateEntry(entry));
            assertEquals(InterviewScheduleStatus.IN_PROGRESS,schedule.getStatus());
            assertFalse(schedule.expireIfAbsent(time.plusHours(2)));
        }
    }
    @Test void thirtyMinutesAndOneNanosecondExpiresTheInterview() {
        var schedule=schedule(time);
        assertThrows(IllegalStateException.class,()->schedule.validateEntry(time.plusMinutes(30).plusNanos(1)));
        assertEquals(InterviewScheduleStatus.NO_SHOW,schedule.getStatus());
        assertEquals(InterviewTokenStatus.EXPIRED,schedule.getTokenStatus());
    }
    @Test void darAhoraIsKeptAndCannotBeChosenTwice() {
        var slot=new InterviewSlot(time,InterviewSlot.SlotStatus.AVAILABLE);
        var schedule=new InterviewSchedule("schedule","process","candidate","job",InterviewType.THEORY,List.of(slot,slot,slot));
        var before=LocalDateTime.now(ZoneOffset.UTC);schedule.chooseNow();var after=LocalDateTime.now(ZoneOffset.UTC);
        assertFalse(schedule.getChosenSlot().getDateTime().isBefore(before));
        assertFalse(schedule.getChosenSlot().getDateTime().isAfter(after));
        assertTrue(schedule.validateEntry(after));
        assertThrows(IllegalStateException.class,schedule::chooseNow);
    }
    @Test void aPastSlotCannotBeReserved() {
        var past=new InterviewSlot(LocalDateTime.now(ZoneOffset.UTC).minusHours(1),InterviewSlot.SlotStatus.AVAILABLE);
        var schedule=new InterviewSchedule("schedule","process","candidate","job",InterviewType.THEORY,List.of(past,past,past));
        assertThrows(IllegalStateException.class,()->schedule.chooseSlot(0));
    }
    @Test void automaticExpiryCancelsOnlyTheAbsentInterview() {
        var past=LocalDateTime.now(ZoneOffset.UTC).minusMinutes(31);
        var schedule=schedule(past);
        var interview=Interview.restore(InterviewId.of(UUID.randomUUID().toString()),"candidate","job",InterviewType.TECHNICAL,
                InterviewStatus.SCHEDULED,0,past,null,null,null,new RecordingSession(null,false),new ArrayList<>(),new ArrayList<>(),new ArrayList<>());
        var interviews=mock(InterviewRepository.class);var schedules=mock(InterviewScheduleRepository.class);
        when(schedules.findReserved()).thenReturn(List.of(schedule));when(interviews.findByCandidateId("candidate")).thenReturn(List.of(interview));
        new InterviewAttendanceService(interviews,schedules).expireOverdue();
        assertEquals(InterviewStatus.ABORTED,interview.getStatus());assertTrue(interview.getAbortReason().contains("inasistencia"));
        assertEquals(InterviewScheduleStatus.NO_SHOW,schedule.getStatus());verify(schedules).save(schedule);
    }
    @Test void automaticExpiryDoesNotCancelAnInterviewInProgress() {
        var past=LocalDateTime.now(ZoneOffset.UTC).minusMinutes(31);
        var schedule=schedule(past);
        var interview=Interview.restore(InterviewId.of(UUID.randomUUID().toString()),"candidate","job",InterviewType.TECHNICAL,
                InterviewStatus.IN_PROGRESS,0,past,null,null,null,new RecordingSession(null,false),new ArrayList<>(),new ArrayList<>(),new ArrayList<>());
        var interviews=mock(InterviewRepository.class);var schedules=mock(InterviewScheduleRepository.class);
        when(schedules.findReserved()).thenReturn(List.of(schedule));when(interviews.findByCandidateId("candidate")).thenReturn(List.of(interview));
        new InterviewAttendanceService(interviews,schedules).expireOverdue();
        assertEquals(InterviewStatus.IN_PROGRESS,interview.getStatus());verify(schedules,never()).save(any());
    }
}
