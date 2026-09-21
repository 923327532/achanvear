package achanvear.peru.notifications.infrastructure.persistence;

import achanvear.peru.notifications.domain.model.Notification;
import achanvear.peru.notifications.domain.model.NotificationChannel;
import achanvear.peru.notifications.domain.model.NotificationId;
import achanvear.peru.notifications.domain.model.NotificationStatus;
import achanvear.peru.notifications.domain.model.NotificationType;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

    public NotificationJpaEntity toEntity(Notification notification) {
        return new NotificationJpaEntity(
                notification.getId().toString(),
                notification.getRecipient(),
                notification.getSubject(),
                notification.getContent(),
                notification.getChannel().name(),
                notification.getType().name(),
                notification.getStatus().name(),
                notification.getCreatedAt(),
                notification.getSentAt(),
                notification.getFailureReason()
        );
    }

    public Notification toDomain(NotificationJpaEntity entity) {
        return new Notification(
                NotificationId.of(entity.getId()),
                entity.getRecipient(),
                entity.getSubject(),
                entity.getContent(),
                NotificationChannel.valueOf(entity.getChannel()),
                NotificationType.valueOf(entity.getType()),
                NotificationStatus.valueOf(entity.getStatus()),
                entity.getCreatedAt(),
                entity.getSentAt(),
                entity.getFailureReason()
        );
    }
}
