package achanvear.peru.interview.infrastructure.persistence;

import achanvear.peru.interview.application.port.AbandonedInterviewCleanupPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;

@Repository
public class JdbcAbandonedInterviewCleanup implements AbandonedInterviewCleanupPort {
    private final JdbcTemplate jdbc;

    public JdbcAbandonedInterviewCleanup(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @Override
    @Transactional
    public List<String> closeInactiveBefore(Instant cutoff) {
        return jdbc.query("""
                UPDATE interviews i
                SET status='ABORTED',
                    abort_reason='Cancelada por sesion abandonada: mas de 24 horas sin actividad registrada',
                    recording_active=false, updated_at=CURRENT_TIMESTAMP
                WHERE i.status='IN_PROGRESS'
                  AND COALESCE(i.updated_at,i.created_at) < ?
                  AND i.score IS NULL
                  AND NOT EXISTS (
                      SELECT 1 FROM interview_evaluation_details e WHERE e.interview_id=i.id
                  )
                RETURNING i.id
                """, (rs, row) -> rs.getString(1), Timestamp.from(cutoff));
    }
}
