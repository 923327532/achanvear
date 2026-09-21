package achanvear.peru.interview.application;

public interface RealtimeInterviewSessionUseCase {

    void openSession(String interviewId);

    void closeSession(String interviewId);

    void disconnectSession(String interviewId);
}
