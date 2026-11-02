package achanvear.peru.notifications.application;

import java.util.UUID;

public interface NotificationWriter {
    void publish(UUID recipient, String category, String title, String message, String eventKey);
}
