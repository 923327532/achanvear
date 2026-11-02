package achanvear.peru.profile.infrastructure.persistence;

import achanvear.peru.profile.application.port.CvVisibilityPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public class JdbcCvVisibility implements CvVisibilityPort {
    private final JdbcTemplate jdbc;

    public JdbcCvVisibility(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public String visibility(UUID ownerId) {
        return jdbc.query("""
                SELECT COALESCE(cv_visibility,'VERIFIED_COMPANIES_ONLY')
                FROM freelancer_profiles WHERE user_id=?
                """, (rs, row) -> rs.getString(1), ownerId)
                .stream().findFirst().orElse("VERIFIED_COMPANIES_ONLY");
    }

    @Override
    public boolean companyExists(UUID userId, UUID companyId, boolean requireValidated) {
        var statuses = jdbc.query("SELECT status FROM companies WHERE owner_user_id=? OR id=?",
                (rs, row) -> rs.getString(1), userId, companyId);
        return !statuses.isEmpty() && (!requireValidated || statuses.contains("VALIDATED"));
    }
}
