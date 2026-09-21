package achanvear.peru.interview.application.dto;

public record SubmitAnswerResponse(
        String interviewId,
        String questionId,
        String answerId,
        Integer score,
        String feedback,
        QuestionResponse nextQuestion,
        boolean interviewCompleted
) {
}
