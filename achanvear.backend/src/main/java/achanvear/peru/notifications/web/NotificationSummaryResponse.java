package achanvear.peru.notifications.web;

import achanvear.peru.notifications.application.dto.NotificationResponse;
import achanvear.peru.notifications.domain.model.NotificationStatus;
import achanvear.peru.notifications.domain.model.NotificationType;

import java.time.Instant;

public record NotificationSummaryResponse(
        String id,
        String recipient,
        String subject,
        NotificationType type,
        NotificationStatus status,
        Instant createdAt,
        Instant sentAt
) {

    public static NotificationSummaryResponse from(NotificationResponse response) {
        return new NotificationSummaryResponse(
                response.id(),
                response.recipient(),
                response.subject(),
                response.type(),
                response.status(),
                response.createdAt(),
                response.sentAt()
        );
    }
}
