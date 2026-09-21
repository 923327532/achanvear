package achanvear.peru.notifications.application.usecase;

import achanvear.peru.notifications.application.dto.NotificationResponse;

import java.util.List;

public interface ListNotificationsUseCase {

    List<NotificationResponse> execute(String recipient);
}
