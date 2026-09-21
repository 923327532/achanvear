package achanvear.peru.interview.application.dto;

public record AnswerResponse(
        String id,
        String questionId,
        String content,
        Integer score
) {
}
