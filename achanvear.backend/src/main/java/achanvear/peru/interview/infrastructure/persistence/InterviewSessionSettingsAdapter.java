package achanvear.peru.interview.infrastructure.persistence;

import achanvear.peru.interview.application.port.InterviewSessionSettingsPort;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;

@Component
public class InterviewSessionSettingsAdapter implements InterviewSessionSettingsPort {
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;
    private final String secret;

    public InterviewSessionSettingsAdapter(JdbcTemplate jdbc, ObjectMapper mapper,
            @Value("${AGENT_SHARED_SECRET:}") String secret) {
        this.jdbc = jdbc;
        this.mapper = mapper;
        this.secret = secret;
    }

    @Override
    public Map<String, Object> presentationSettings(String interviewId) {
        var rows = jdbc.query("""
                SELECT question_count,time_limit_minutes,case_code FROM interview_presentation_settings
                WHERE interview_id=? AND valid_until>CURRENT_TIMESTAMP
                """, (rs, n) -> Map.<String,Object>of("question_count", rs.getInt(1),
                    "time_limit_minutes", rs.getInt(2), "case_code", rs.getString(3)), interviewId);
        return rows.isEmpty() ? Map.of() : rows.get(0);
    }

    @Override
    public String issueAccessToken(String interviewId, Map<String, Object> presentation) {
        if (secret.isBlank()) return "";
        try {
            var encoder = Base64.getUrlEncoder().withoutPadding();
            var payload = encoder.encodeToString(mapper.writeValueAsBytes(Map.of(
                    "session_id", interviewId, "exp", Instant.now().plusSeconds(43200).getEpochSecond(),
                    "presentation", presentation)));
            var mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return payload + "." + encoder.encodeToString(mac.doFinal(payload.getBytes(StandardCharsets.US_ASCII)));
        } catch (Exception exception) {
            throw new IllegalStateException("No se pudo autorizar la sesión del agente", exception);
        }
    }
}
