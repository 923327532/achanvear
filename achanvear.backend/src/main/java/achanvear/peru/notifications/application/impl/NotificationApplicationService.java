package achanvear.peru.notifications.application.impl;

import achanvear.peru.notifications.application.dto.NotificationResponse;
import achanvear.peru.notifications.application.usecase.ListNotificationsUseCase;
import achanvear.peru.notifications.application.usecase.SendNotificationEmailUseCase;
import achanvear.peru.notifications.domain.model.Notification;
import achanvear.peru.notifications.domain.model.NotificationType;
import achanvear.peru.notifications.domain.repository.NotificationRepository;
import achanvear.peru.notifications.infrastructure.external.BrevoEmailClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class NotificationApplicationService implements 
        SendNotificationEmailUseCase,
        ListNotificationsUseCase {

    private final NotificationRepository notificationRepository;
    private final BrevoEmailClient brevoEmailClient;

    public NotificationApplicationService(
            NotificationRepository notificationRepository,
            BrevoEmailClient brevoEmailClient
    ) {
        this.notificationRepository = notificationRepository;
        this.brevoEmailClient = brevoEmailClient;
    }

    @Override
    public NotificationResponse execute(
            String recipient,
            String subject,
            String content,
            NotificationType type
    ) {
        Notification notification = Notification.createEmail(
                recipient,
                subject,
                content,
                type
        );

        notificationRepository.save(notification);

        try {
            brevoEmailClient.sendEmail(recipient, subject, content);
            notification.markAsSent();
        } catch (Exception exception) {
            notification.markAsFailed(exception.getMessage() != null ? exception.getMessage() : "Unknown error");
        }

        notificationRepository.save(notification);

        return NotificationResponse.from(notification);
    }

    @Override
    public List<NotificationResponse> execute(String recipient) {
        return notificationRepository.findByRecipient(recipient)
                .stream()
                .map(NotificationResponse::from)
                .toList();
    }
}
