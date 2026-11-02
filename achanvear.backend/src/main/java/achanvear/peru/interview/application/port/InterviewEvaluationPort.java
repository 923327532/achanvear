package achanvear.peru.interview.application.port;

import java.util.Map;

public interface InterviewEvaluationPort {
    void save(String interviewId, Map<?, ?> evaluation);

    Map<String, Object> find(String interviewId);
}
