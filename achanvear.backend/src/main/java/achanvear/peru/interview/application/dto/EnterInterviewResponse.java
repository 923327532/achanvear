package achanvear.peru.interview.application.dto;

public record EnterInterviewResponse(
        String scheduleId,
        String hiringProcessId,
        String candidateId,
        String interviewType,
        String message
) {
}
