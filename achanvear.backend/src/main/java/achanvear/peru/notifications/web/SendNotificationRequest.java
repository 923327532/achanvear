package achanvear.peru.notifications.web;

import achanvear.peru.notifications.domain.model.NotificationType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SendNotificationRequest(

        @NotBlank
        @Email
        String recipient,

        @NotBlank
        String subject,

        @NotBlank
        String content,

        @NotNull
        NotificationType type
) {
}
