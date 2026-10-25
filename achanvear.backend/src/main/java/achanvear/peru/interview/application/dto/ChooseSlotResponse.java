package achanvear.peru.interview.application.dto;

import java.time.LocalDateTime;

public record ChooseSlotResponse(
        String scheduleId,
        String interviewToken,
        java.time.OffsetDateTime chosenDateTime,
        String message,
        String interviewId
) {
}
