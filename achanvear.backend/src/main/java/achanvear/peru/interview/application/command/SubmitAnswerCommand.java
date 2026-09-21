package achanvear.peru.interview.application.command;

public record SubmitAnswerCommand(
        String interviewId,
        String questionId,
        String answerContent
) {
}