package achanvear.peru.interview.application.port;

public interface InterviewRecordingPort {
    String saveRecording(String interviewId, String fileKey);
}
