package achanvear.peru.interview.application.port;

import java.util.Map;

public interface InterviewSessionSettingsPort {
    Map<String, Object> presentationSettings(String interviewId);
    String issueAccessToken(String interviewId, Map<String, Object> presentation);
}
