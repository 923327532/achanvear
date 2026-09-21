package achanvear.peru.interview.application.command;

public record AbortInterviewSessionCommand(
        String interviewId,
        String reason
) {
}
