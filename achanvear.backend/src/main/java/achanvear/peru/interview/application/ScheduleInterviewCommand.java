package achanvear.peru.interview.application;

public record ScheduleInterviewCommand(
        String hiringProcessId,
        String candidateId,
        String interviewType,
        Integer theoryScore,
        Boolean conciseAnswers,
        Boolean leadershipProfile,
        String interviewerProfileCode
) {
}