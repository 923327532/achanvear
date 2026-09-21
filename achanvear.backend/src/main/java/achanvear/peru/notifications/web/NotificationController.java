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

    private final SendNotificationEmailUseCase sendNotificationEmailUseCase;
    private final ListNotificationsUseCase listNotificationsUseCase;

    public NotificationController(
            SendNotificationEmailUseCase sendNotificationEmailUseCase,
            ListNotificationsUseCase listNotificationsUseCase
    ) {
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
    public ResponseEntity<ApiResponse<List<InAppNotificationResponse>>> getInAppNotifications(
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        // Return empty list for now - can be extended with a real in-app notification store
        List<InAppNotificationResponse> notifications = new ArrayList<>();
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
        // Placeholder - mark notification as read
        return ResponseEntity.ok(
                ApiResponse.success(null, "Notification marked as read")
        );
    }

    // ─── PATCH /notifications/read-all ─────────────────────────────────────────
    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @AuthenticationPrincipal AuthenticatedUser user
    ) {
        // Placeholder - mark all notifications as read
        return ResponseEntity.ok(
                ApiResponse.success(null, "All notifications marked as read")
        );
    }

    // ─── DTO ───────────────────────────────────────────────────────────────────
    // Coincide con el tipo Notification del frontend:
    // { id, category, title, message, createdAt (ISO string), read }
    record InAppNotificationResponse(
            String id,
            String category,
            String title,
            String message,
            String createdAt,
            boolean read
    ) {}
}
