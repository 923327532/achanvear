package achanvear.peru.interview.infrastructure.websocket;

public record SocketMessage(
        String type,
        String interviewId,
        String payload
) {
}
