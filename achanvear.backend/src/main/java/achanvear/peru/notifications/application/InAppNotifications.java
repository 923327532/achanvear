package achanvear.peru.notifications.application;
import java.util.List;
import java.util.UUID;
public interface InAppNotifications {
    record Item(String id, String category, String title, String message, String createdAt, boolean read) {}
    List<Item> list(UUID userId);
    long unread(UUID userId);
    void markRead(UUID userId, UUID id);
    void markAllRead(UUID userId);
}
