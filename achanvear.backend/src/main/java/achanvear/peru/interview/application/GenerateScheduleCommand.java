package achanvear.peru.interview.application;

public record GenerateScheduleCommand(
        String hiringProcessId,
        String candidateId,
        String jobId,
        String interviewType,
        String candidateName,
        String jobTitle
) {
}
