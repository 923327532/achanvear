package achanvear.peru.interview.infrastructure.websocket;

public final class SocketMessageType {

    public static final String SESSION_STARTED = "SESSION_STARTED";
    public static final String QUESTION = "QUESTION";
    public static final String ANSWER_SUBMITTED = "ANSWER_SUBMITTED";
    public static final String VIOLATION_REPORTED = "VIOLATION_REPORTED";
    public static final String SESSION_ABORTED = "SESSION_ABORTED";
    public static final String SESSION_COMPLETED = "SESSION_COMPLETED";
    public static final String ERROR = "ERROR";

    private SocketMessageType() {
    }
}
