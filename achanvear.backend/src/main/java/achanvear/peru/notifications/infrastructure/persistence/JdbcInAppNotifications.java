package achanvear.peru.notifications.infrastructure.persistence;
import achanvear.peru.notifications.application.InAppNotifications;
import achanvear.peru.shared.domain.exception.ResourceNotFoundException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.*;
@Repository
public class JdbcInAppNotifications implements InAppNotifications {
    private final JdbcTemplate jdbc;
    public JdbcInAppNotifications(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    public List<Item> list(UUID userId) {
        return jdbc.query("SELECT * FROM in_app_notifications WHERE user_id=? ORDER BY created_at DESC,id DESC",
                (rs,n) -> new Item(rs.getString("id"),rs.getString("category"),rs.getString("title"),
                        rs.getString("message"),rs.getTimestamp("created_at").toInstant().toString(),rs.getTimestamp("read_at")!=null),userId);
    }
    public long unread(UUID userId) { return jdbc.queryForObject("SELECT COUNT(*) FROM in_app_notifications WHERE user_id=? AND read_at IS NULL",Long.class,userId); }
    public void markRead(UUID userId, UUID id) {
        if (jdbc.update("UPDATE in_app_notifications SET read_at=COALESCE(read_at,CURRENT_TIMESTAMP) WHERE id=? AND user_id=?",id,userId)==0)
            throw new ResourceNotFoundException("Notification not found");
    }
    public void markAllRead(UUID userId) { jdbc.update("UPDATE in_app_notifications SET read_at=CURRENT_TIMESTAMP WHERE user_id=? AND read_at IS NULL",userId); }
}
