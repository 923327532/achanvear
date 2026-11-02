package achanvear.peru.interview.infrastructure.persistence;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.Map;

@Repository
public class InterviewEvaluationStore implements achanvear.peru.interview.application.port.InterviewEvaluationPort {
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;

    public InterviewEvaluationStore(JdbcTemplate jdbc, ObjectMapper mapper) {
        this.jdbc = jdbc;
        this.mapper = mapper;
    }

    @Override
    public void save(String interviewId, Map<?, ?> evaluation) {
        Integer communication = achanvear.peru.interview.domain.model.InterviewScore.validatedValue(evaluation.get("communication_score"));
        try {
            jdbc.update("""
                INSERT INTO interview_evaluation_details(interview_id, communication_score, evaluation_json)
                VALUES (?, ?, ?) ON CONFLICT (interview_id) DO NOTHING
                """, interviewId, communication, mapper.writeValueAsString(evaluation));
        } catch (com.fasterxml.jackson.core.JsonProcessingException exception) {
            throw new IllegalStateException("Could not persist interview evaluation", exception);
        }
    }

    @Override
    public Map<String, Object> find(String interviewId) {
        var rows = jdbc.query("SELECT evaluation_json FROM interview_evaluation_details WHERE interview_id=?",
                (rs, n) -> rs.getString(1), interviewId);
        if (rows.isEmpty()) return Map.of();
        try {
            return mapper.readValue(rows.get(0), new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
        } catch (com.fasterxml.jackson.core.JsonProcessingException exception) {
            throw new IllegalStateException("Could not read interview evaluation", exception);
        }
    }
}
