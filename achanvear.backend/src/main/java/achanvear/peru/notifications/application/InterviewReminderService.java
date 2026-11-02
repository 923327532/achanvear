package achanvear.peru.notifications.application;

import achanvear.peru.interview.domain.repository.InterviewScheduleRepository;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

@Service
public class InterviewReminderService {
    private final InterviewScheduleRepository schedules;
    private final NotificationWriter notifications;

    public InterviewReminderService(InterviewScheduleRepository schedules, NotificationWriter notifications) {
        this.schedules = schedules;
        this.notifications = notifications;
    }
    @Scheduled(fixedDelayString="${interviews.reminder-check-ms:60000}")
    @Transactional
    public void remindUpcoming() {
        var now = LocalDateTime.now(ZoneOffset.UTC);
        for (var schedule : schedules.findReserved()) {
            if (schedule.getChosenSlot() == null) continue;
            var time = schedule.getChosenSlot().getDateTime();
            if (!time.isAfter(now) || time.isAfter(now.plusMinutes(15))) continue;
            notifications.publish(UUID.fromString(schedule.getCandidateId()), "INTERVIEW",
                    "Tu entrevista comienza pronto", "Tu entrevista está programada dentro de los próximos 15 minutos.",
                    "reminder:" + schedule.getId());
        }
    }
}
