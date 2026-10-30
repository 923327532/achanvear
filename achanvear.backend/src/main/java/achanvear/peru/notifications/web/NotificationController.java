package achanvear.peru.notifications.web;

import achanvear.peru.notifications.application.dto.NotificationResponse;
import achanvear.peru.notifications.application.usecase.ListNotificationsUseCase;
import achanvear.peru.notifications.application.usecase.SendNotificationEmailUseCase;
import achanvear.peru.shared.security.AuthenticatedUser;
import achanvear.peru.shared.web.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final achanvear.peru.notifications.application.InAppNotifications inApp;
    private final SendNotificationEmailUseCase sendNotificationEmailUseCase;
    private final ListNotificationsUseCase listNotificationsUseCase;

    public NotificationController(
            SendNotificationEmailUseCase sendNotificationEmailUseCase,
            ListNotificationsUseCase listNotificationsUseCase,
            achanvear.peru.notifications.application.InAppNotifications inApp
    ) {
        this.inApp = inApp;
        this.sendNotificationEmailUseCase = sendNotificationEmailUseCase;
        this.listNotificationsUseCase = listNotificationsUseCase;
    }

    @PostMapping("/email")
    public ResponseEntity<ApiResponse<NotificationSummaryResponse>> sendEmailNotification(
            @Valid @RequestBody SendNotificationRequest request
    ) {
        NotificationResponse response = sendNotificationEmailUseCase.execute(
                request.recipient(),
                request.subject(),
                request.content(),
                request.type()
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(
                        NotificationSummaryResponse.from(response),
                        "Notification sent successfully"
                ));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<java.util.List<NotificationSummaryResponse>>> listNotifications(
            @RequestParam String recipient
    ) {
        java.util.List<NotificationSummaryResponse> response = listNotificationsUseCase.execute(recipient)
                .stream()
                .map(NotificationSummaryResponse::from)
                .toList();

        return ResponseEntity.ok(
                ApiResponse.success(response, "Notifications fetched successfully")
        );
    }

    // ─── GET /notifications/in-app ─────────────────────────────────────────────
    @GetMapping("/in-app")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<achanvear.peru.notifications.application.InAppNotifications.Item>>> getInAppNotifications(
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        var notifications = inApp.list(user.getUserId());
        return ResponseEntity.ok(
                ApiResponse.success(notifications, "In-app notifications fetched successfully")
        );
    }

    // ─── PATCH /notifications/{id}/read ────────────────────────────────────────
    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable String id,
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        inApp.markRead(user.getUserId(), java.util.UUID.fromString(id));
        return ResponseEntity.ok(
                ApiResponse.success(null, "Notification marked as read")
        );
    }

    // ─── PATCH /notifications/read-all ─────────────────────────────────────────
    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        inApp.markAllRead(user.getUserId());
        return ResponseEntity.ok(
                ApiResponse.success(null, "All notifications marked as read")
        );
    }

    @GetMapping("/in-app/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<Long> unreadCount(@AuthenticationPrincipal AuthenticatedUser user) {
        return ApiResponse.success(inApp.unread(user.getUserId()), "Unread count");
    }
}
