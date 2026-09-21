package achanvear.peru.interview.infrastructure.websocket;

public record SubmitAnswerSocketPayload(
        String questionId,
        String answerContent
) {
}
