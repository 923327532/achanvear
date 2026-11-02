package achanvear.peru.notifications.infrastructure.persistence;
import achanvear.peru.notifications.application.InAppNotifications;
import achanvear.peru.shared.domain.exception.ResourceNotFoundException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.*;
@Repository
public class JdbcInAppNotifications implements InAppNotifications, achanvear.peru.notifications.application.NotificationWriter {
    private final JdbcTemplate jdbc;
    public JdbcInAppNotifications(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    @Override
    public void publish(UUID recipient, String category, String title, String message, String eventKey) {
        jdbc.update("""
                INSERT INTO in_app_notifications(user_id,category,title,message,event_key)
                VALUES(?,?,?,?,?) ON CONFLICT DO NOTHING
                """, recipient, category, title, message, eventKey);
    }
    public List<Item> list(UUID userId) {
        var preferences = preferences(userId);
        return jdbc.query("""
                SELECT n.* FROM in_app_notifications n WHERE n.user_id=?
                AND NOT EXISTS (
                    SELECT 1 FROM companies c JOIN job_applications a ON n.event_key='application:' || a.id::text
                    WHERE c.owner_user_id=n.user_id AND a.screening_score IS NOT NULL
                      AND a.screening_score < COALESCE(c.match_score_threshold,70)
                ) ORDER BY n.created_at DESC,n.id DESC
                """,
                (rs,n) -> enabled(preferences, rs.getString("category"), rs.getString("event_key")) ? new Item(rs.getString("id"),rs.getString("category"),rs.getString("title"),
                        rs.getString("message"),rs.getTimestamp("created_at").toInstant().toString(),rs.getTimestamp("read_at")!=null) : null,userId)
                .stream().filter(Objects::nonNull).toList();
    }
    private com.fasterxml.jackson.databind.JsonNode preferences(UUID userId) {
        var rows = jdbc.query("SELECT notification_preferences FROM freelancer_profiles WHERE user_id=?", (rs,n) -> rs.getString(1), userId);
        try { return rows.isEmpty() || rows.get(0) == null ? null : new com.fasterxml.jackson.databind.ObjectMapper().readTree(rows.get(0)); }
        catch (Exception ignored) { return null; }
    }
    private boolean enabled(com.fasterxml.jackson.databind.JsonNode preferences, String category, String eventKey) {
        if (preferences == null) return true;
        String key = eventKey != null && eventKey.startsWith("match:") ? "match" : switch (category) { case "PAYMENT" -> "payment"; case "INTERVIEW" -> "interview"; case "JOB" -> "new_job"; default -> null; };
        return key == null || !preferences.has(key) || !preferences.get(key).isBoolean() || preferences.get(key).asBoolean();
    }
    public long unread(UUID userId) { return list(userId).stream().filter(item -> !item.read()).count(); }
    public void markRead(UUID userId, UUID id) {
        if (jdbc.update("UPDATE in_app_notifications SET read_at=COALESCE(read_at,CURRENT_TIMESTAMP) WHERE id=? AND user_id=?",id,userId)==0)
            throw new ResourceNotFoundException("Notification not found");
    }
    public void markAllRead(UUID userId) { jdbc.update("UPDATE in_app_notifications SET read_at=CURRENT_TIMESTAMP WHERE user_id=? AND read_at IS NULL",userId); }
}
