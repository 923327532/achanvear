package achanvear.peru.interview.infrastructure.persistence;

import achanvear.peru.interview.application.port.InterviewReportQueryPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public class JdbcInterviewReportQueries implements InterviewReportQueryPort {
    private final JdbcTemplate jdbc;

    public JdbcInterviewReportQueries(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public List<String> findCompletedIds(String candidateId, String jobId, String hiringProcessId) {
        return jdbc.query("""
                SELECT id FROM interviews WHERE candidate_id=? AND hiring_process_id IN (?, ?)
                  AND status='COMPLETED' ORDER BY created_at, id
                """, (rs, row) -> rs.getString(1), candidateId, jobId, hiringProcessId);
    }

    @Override
    public String findJobTitle(String jobId) {
        return jdbc.queryForObject("SELECT title FROM job_posts WHERE id::text=?", String.class, jobId);
    }

    @Override
    public boolean canRead(String interviewId, UUID userId, UUID companyId) {
        var count = jdbc.queryForObject("""
                SELECT count(*) FROM interviews i WHERE i.id=? AND (
                  i.candidate_id=? OR EXISTS (
                    SELECT 1 FROM job_posts j WHERE j.company_id::text=? AND (
                      j.id::text=i.hiring_process_id OR j.id::text IN (
                        SELECT h.job_id FROM hiring_processes h WHERE h.id=i.hiring_process_id))))
                """, Integer.class, interviewId, userId.toString(), companyId == null ? "" : companyId.toString());
        return count != null && count > 0;
    }
}
