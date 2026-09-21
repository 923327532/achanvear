package achanvear.peru.interview.application.dto;

public record InterviewSessionResponse(
        String interviewId,
        String hiringProcessId,
        String candidateId,
        String interviewType,
        String status,
        String interviewerName,
        String interviewerStyle,
        String interviewerVoice,
        Integer availableSlots,
        String firstQuestionContent,
        String challengeJson
) {
}