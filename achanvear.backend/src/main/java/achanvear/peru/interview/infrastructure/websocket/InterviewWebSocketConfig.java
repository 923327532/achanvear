package achanvear.peru.interview.infrastructure.websocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class InterviewWebSocketConfig implements WebSocketConfigurer {

    private final InterviewWebSocketHandler interviewWebSocketHandler;
    private final InterviewHandshakeInterceptor interviewHandshakeInterceptor;

    public InterviewWebSocketConfig(
            InterviewWebSocketHandler interviewWebSocketHandler,
            InterviewHandshakeInterceptor interviewHandshakeInterceptor
    ) {
        this.interviewWebSocketHandler = interviewWebSocketHandler;
        this.interviewHandshakeInterceptor = interviewHandshakeInterceptor;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(interviewWebSocketHandler, "/ws/interviews")
                .addInterceptors(interviewHandshakeInterceptor)
                .setAllowedOriginPatterns("*");
    }
}
