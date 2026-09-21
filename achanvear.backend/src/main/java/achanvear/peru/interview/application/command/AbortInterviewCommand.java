package achanvear.peru.interview.application.command;

public record AbortInterviewCommand(
        String interviewId,
        String reason
) {
}
