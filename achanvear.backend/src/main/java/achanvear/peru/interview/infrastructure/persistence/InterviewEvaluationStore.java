package achanvear.peru.interview.infrastructure.persistence;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.Map;

@Repository
public class InterviewEvaluationStore {
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;

    public InterviewEvaluationStore(JdbcTemplate jdbc, ObjectMapper mapper) {
        this.jdbc = jdbc;
        this.mapper = mapper;
    }

    public void save(String interviewId, Map<?, ?> evaluation) {
        Integer communication = score(evaluation.get("communication_score"));
        try {
            jdbc.update("""
                INSERT INTO interview_evaluation_details(interview_id, communication_score, evaluation_json)
                VALUES (?, ?, ?) ON CONFLICT (interview_id) DO NOTHING
                """, interviewId, communication, mapper.writeValueAsString(evaluation));
        } catch (com.fasterxml.jackson.core.JsonProcessingException exception) {
            throw new IllegalStateException("Could not persist interview evaluation", exception);
        }
    }

    public static Integer score(Object value) {
        if (value == null) return null;
        if (!(value instanceof Number number) || !Double.isFinite(number.doubleValue())
                || number.doubleValue() < 0 || number.doubleValue() > 100) {
            throw new IllegalStateException("Invalid interview score");
        }
        return (int) Math.round(number.doubleValue());
    }
}
