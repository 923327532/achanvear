package achanvear.peru.notifications.domain.repository;

import achanvear.peru.notifications.domain.model.Notification;
import achanvear.peru.notifications.domain.model.NotificationId;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository {

    void save(Notification notification);

    Optional<Notification> findById(NotificationId id);

    List<Notification> findByRecipient(String recipient);
}
