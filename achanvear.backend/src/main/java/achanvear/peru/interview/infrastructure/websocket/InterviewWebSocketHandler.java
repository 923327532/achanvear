package achanvear.peru.interview.infrastructure.websocket;

import achanvear.peru.interview.application.RealtimeInterviewSessionUseCase;
import achanvear.peru.interview.application.SubmitAnswerUseCase;
import achanvear.peru.interview.application.command.SubmitAnswerCommand;
import achanvear.peru.interview.application.dto.SubmitAnswerResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class InterviewWebSocketHandler extends TextWebSocketHandler {

    private final ObjectMapper objectMapper;
    private final SubmitAnswerUseCase submitAnswerUseCase;
    private final RealtimeInterviewSessionUseCase realtimeInterviewSessionUseCase;
    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    public InterviewWebSocketHandler(
            ObjectMapper objectMapper,
            SubmitAnswerUseCase submitAnswerUseCase,
            RealtimeInterviewSessionUseCase realtimeInterviewSessionUseCase
    ) {
        this.objectMapper = objectMapper;
        this.submitAnswerUseCase = submitAnswerUseCase;
        this.realtimeInterviewSessionUseCase = realtimeInterviewSessionUseCase;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.put(session.getId(), session);
        String interviewId = (String) session.getAttributes().get("interviewId");
        realtimeInterviewSessionUseCase.openSession(interviewId);

        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(
                new SocketMessage(
                        SocketMessageType.SESSION_STARTED,
                        interviewId,
                        "{\"message\":\"Interview session started\"}"
                )
        )));
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage textMessage) throws Exception {
        String interviewId = (String) session.getAttributes().get("interviewId");
        SocketMessage incoming = objectMapper.readValue(textMessage.getPayload(), SocketMessage.class);

        switch (incoming.type()) {
            case SocketMessageType.ANSWER_SUBMITTED -> {
                SubmitAnswerSocketPayload payload =
                        objectMapper.readValue(incoming.payload(), SubmitAnswerSocketPayload.class);

                SubmitAnswerResponse response = submitAnswerUseCase.execute(
                        new SubmitAnswerCommand(
                                interviewId,
                                payload.questionId(),
                                payload.answerContent()
                        )
                );

                session.sendMessage(new TextMessage(objectMapper.writeValueAsString(
                        new SocketMessage(
                                SocketMessageType.ANSWER_SUBMITTED,
                                interviewId,
                                objectMapper.writeValueAsString(response)
                        )
                )));

                if (response.interviewCompleted() && session.isOpen()) {
                    session.sendMessage(new TextMessage(objectMapper.writeValueAsString(
                            new SocketMessage(
                                    SocketMessageType.SESSION_COMPLETED,
                                    interviewId,
                                    "{\"message\":\"Interview session completed\"}"
                            )
                    )));
                    session.close();
                }
            }

            case "PING" -> session.sendMessage(new TextMessage(
                    objectMapper.writeValueAsString(
                            new SocketMessage("PONG", interviewId, "{\"message\":\"alive\"}")
                    )
            ));

            default -> session.sendMessage(new TextMessage(
                    objectMapper.writeValueAsString(
                            new SocketMessage(
                                    SocketMessageType.ERROR,
                                    interviewId,
                                    "{\"message\":\"Unsupported message type\"}"
                            )
                    )
            ));
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session.getId());
        String interviewId = (String) session.getAttributes().get("interviewId");
        if (interviewId != null) {
            realtimeInterviewSessionUseCase.disconnectSession(interviewId);
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        String interviewId = (String) session.getAttributes().get("interviewId");
        if (interviewId != null) {
            realtimeInterviewSessionUseCase.disconnectSession(interviewId);
        }

        if (session.isOpen()) {
            session.close(CloseStatus.SERVER_ERROR);
        }
    }

    public void sendToSession(String sessionId, String payload) {
        WebSocketSession session = sessions.get(sessionId);
        if (session != null && session.isOpen()) {
            try {
                session.sendMessage(new TextMessage(payload));
            } catch (IOException ignored) {
            }
        }
    }
}