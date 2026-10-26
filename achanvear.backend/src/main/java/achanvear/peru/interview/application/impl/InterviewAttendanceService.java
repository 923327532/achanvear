package achanvear.peru.interview.application.impl;

import achanvear.peru.interview.domain.model.*;
import achanvear.peru.interview.domain.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.*;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Service
public class InterviewAttendanceService {
    private final InterviewRepository interviews;
    private final InterviewScheduleRepository schedules;
    public InterviewAttendanceService(InterviewRepository interviews, InterviewScheduleRepository schedules) {
        this.interviews = interviews; this.schedules = schedules;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW, noRollbackFor = IllegalStateException.class)
    public void validateStart(String interviewId) {
        var interview = interviews.findById(InterviewId.of(interviewId)).orElseThrow();
        validate(interview, LocalDateTime.now(ZoneOffset.UTC));
        markPresent(interview);
    }

    @Transactional(noRollbackFor = IllegalStateException.class)
    public void beginPractical(String interviewId) {
        var interview = interviews.findById(InterviewId.of(interviewId)).orElseThrow();
        validate(interview, LocalDateTime.now(ZoneOffset.UTC));
        if (interview.getType() != InterviewType.TECHNICAL) throw new IllegalStateException("La entrevista no es tecnica");
        markPresent(interview);
        if (interview.getStatus() == InterviewStatus.SCHEDULED) {
            interview.start();
            interviews.save(interview);
        }
    }

    private void validate(Interview interview, LocalDateTime now) {
        if (interview.getStatus() == InterviewStatus.IN_PROGRESS) return;
        if (interview.getStatus() != InterviewStatus.SCHEDULED) throw new IllegalStateException("La entrevista ya no esta disponible");
        var slot = interview.getAssignedSlotDateTime();
        if (InterviewEntryWindow.expired(slot, now)) {
            interview.abort("Cancelada por inasistencia: se superaron 30 minutos desde el horario elegido");
            interviews.save(interview);
            for (var schedule : matchingSchedules(interview)) {
                if (schedule.expireIfAbsent(now)) schedules.save(schedule);
            }
        }
        InterviewEntryWindow.validate(slot, now);
    }

    private List<InterviewSchedule> matchingSchedules(Interview interview) {
        return schedules.findByCandidateId(interview.getCandidateId()).stream()
                .filter(s -> s.getInterviewType() == interview.getType()
                        && (s.getJobId().equals(interview.getJobId()) || s.getHiringProcessId().equals(interview.getJobId()))
                        && s.getChosenSlot() != null && s.getChosenSlot().getDateTime().equals(interview.getAssignedSlotDateTime())).toList();
    }

    private void markPresent(Interview interview) {
        for (var schedule : matchingSchedules(interview)) {
            schedule.markStarted(); schedules.save(schedule);
        }
    }

    @Scheduled(fixedDelayString = "${interviews.attendance-check-ms:30000}")
    @Transactional
    public void expireOverdue() {
        var now = LocalDateTime.now(ZoneOffset.UTC);
        for (var schedule : schedules.findReserved()) {
            if (schedule.getChosenSlot() == null || !InterviewEntryWindow.expired(schedule.getChosenSlot().getDateTime(), now)) continue;
            var related = interviews.findByCandidateId(schedule.getCandidateId()).stream()
                    .filter(i -> i.getType() == schedule.getInterviewType()
                            && (i.getJobId().equals(schedule.getJobId()) || i.getJobId().equals(schedule.getHiringProcessId()))
                            && schedule.getChosenSlot().getDateTime().equals(i.getAssignedSlotDateTime())).toList();
            if (related.stream().anyMatch(i -> i.getStatus() == InterviewStatus.IN_PROGRESS || i.getStatus() == InterviewStatus.COMPLETED)) continue;
            if (schedule.expireIfAbsent(now)) {
                schedules.save(schedule);
                related.stream().filter(i -> i.getStatus() == InterviewStatus.SCHEDULED).forEach(i -> {
                    i.abort("Cancelada por inasistencia: se superaron 30 minutos desde el horario elegido");
                    interviews.save(i);
                });
            }
        }
    }
}
