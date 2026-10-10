package achanvear.peru.interview.application.command;

public record CompleteInterviewCommand(
        String interviewId,
        Integer score,
        String summary,
        String evidence
) {
    public CompleteInterviewCommand(String interviewId) {
        this(interviewId, null, null, null);
    }
}
