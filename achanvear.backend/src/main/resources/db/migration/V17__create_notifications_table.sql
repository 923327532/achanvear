CREATE TABLE notifications (
                               id VARCHAR(36) PRIMARY KEY,
                               recipient VARCHAR(255) NOT NULL,
                               subject VARCHAR(255) NOT NULL,
                               content TEXT NOT NULL,
                               channel VARCHAR(30) NOT NULL,
                               type VARCHAR(50) NOT NULL,
                               status VARCHAR(30) NOT NULL,
                               created_at TIMESTAMP WITH TIME ZONE NOT NULL,
                               sent_at TIMESTAMP WITH TIME ZONE NULL,
                               failure_reason TEXT NULL
);

CREATE INDEX idx_notifications_recipient_created_at
    ON notifications(recipient, created_at DESC);

CREATE INDEX idx_notifications_status
    ON notifications(status);

CREATE INDEX idx_notifications_type
    ON notifications(type);