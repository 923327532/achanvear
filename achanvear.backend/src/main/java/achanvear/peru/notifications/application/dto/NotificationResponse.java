package achanvear.peru.notifications.application.dto;

import achanvear.peru.notifications.domain.model.Notification;
import achanvear.peru.notifications.domain.model.NotificationChannel;
import achanvear.peru.notifications.domain.model.NotificationStatus;
import achanvear.peru.notifications.domain.model.NotificationType;

import java.time.Instant;

public record NotificationResponse(
        String id,
        String recipient,
        String subject,
        String content,
        NotificationChannel channel,
        NotificationType type,
        NotificationStatus status,
        Instant createdAt,
        Instant sentAt,
        String failureReason
) {

    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(
                notification.getId().toString(),
                notification.getRecipient(),
                notification.getSubject(),
                notification.getContent(),
                notification.getChannel(),
                notification.getType(),
                notification.getStatus(),
                notification.getCreatedAt(),
                notification.getSentAt(),
                notification.getFailureReason()
        );
    }
}
