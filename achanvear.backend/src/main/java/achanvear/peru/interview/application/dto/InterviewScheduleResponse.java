package achanvear.peru.interview.application.dto;

import java.util.List;

public record InterviewScheduleResponse(
        String scheduleId,
        String hiringProcessId,
        String candidateId,
        String jobId,
        String interviewType,
        List<SlotDto> proposedSlots,
        String status
) {
    public record SlotDto(
            int index,
            String dateTime,
            String status
    ) {
    }
}
