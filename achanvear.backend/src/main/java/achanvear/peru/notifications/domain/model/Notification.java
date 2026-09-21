package achanvear.peru.notifications.domain.model;

import java.time.Instant;
import java.util.Objects;

public class Notification {

    private final NotificationId id;
    private final String recipient;
    private final String subject;
    private final String content;
    private final NotificationChannel channel;
    private final NotificationType type;

    private NotificationStatus status;
    private final Instant createdAt;
    private Instant sentAt;
    private String failureReason;

    public Notification(
            NotificationId id,
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
        this.id = Objects.requireNonNull(id, "Notification id cannot be null");
        this.recipient = Objects.requireNonNull(recipient, "Recipient cannot be null");
        this.subject = Objects.requireNonNull(subject, "Subject cannot be null");
        this.content = Objects.requireNonNull(content, "Content cannot be null");
        this.channel = Objects.requireNonNull(channel, "Channel cannot be null");
        this.type = Objects.requireNonNull(type, "Type cannot be null");
        this.status = Objects.requireNonNull(status, "Status cannot be null");
        this.createdAt = Objects.requireNonNull(createdAt, "CreatedAt cannot be null");
        this.sentAt = sentAt;
        this.failureReason = failureReason;
    }

    public static Notification createEmail(
            String recipient,
            String subject,
            String content,
            NotificationType type
    ) {
        return new Notification(
                NotificationId.generate(),
                recipient,
                subject,
                content,
                NotificationChannel.EMAIL,
                type,
                NotificationStatus.PENDING,
                Instant.now(),
                null,
                null
        );
    }

    public void markAsSent() {
        if (this.status == NotificationStatus.SENT) {
            throw new IllegalStateException("Notification is already sent");
        }
        this.status = NotificationStatus.SENT;
        this.sentAt = Instant.now();
        this.failureReason = null;
    }

    public void markAsFailed(String failureReason) {
        if (failureReason == null || failureReason.isBlank()) {
            throw new IllegalArgumentException("Failure reason cannot be blank");
        }
        this.status = NotificationStatus.FAILED;
        this.failureReason = failureReason;
        this.sentAt = null;
    }

    public NotificationId getId() {
        return id;
    }

    public String getRecipient() {
        return recipient;
    }

    public String getSubject() {
        return subject;
    }

    public String getContent() {
        return content;
    }

    public NotificationChannel getChannel() {
        return channel;
    }

    public NotificationType getType() {
        return type;
    }

    public NotificationStatus getStatus() {
        return status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getSentAt() {
        return sentAt;
    }

    public String getFailureReason() {
        return failureReason;
    }
}
