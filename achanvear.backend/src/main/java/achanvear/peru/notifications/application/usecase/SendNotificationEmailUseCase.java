package achanvear.peru.notifications.application.usecase;

import achanvear.peru.notifications.application.dto.NotificationResponse;
import achanvear.peru.notifications.domain.model.NotificationType;

public interface SendNotificationEmailUseCase {

    NotificationResponse execute(
            String recipient,
            String subject,
            String content,
            NotificationType type
    );
}
