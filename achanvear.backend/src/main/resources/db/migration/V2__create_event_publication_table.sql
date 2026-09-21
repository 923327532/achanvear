CREATE TABLE event_publication (
    id UUID PRIMARY KEY,
    listener_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(255) NOT NULL,
    serialized_event TEXT NOT NULL,
    publication_date TIMESTAMP NOT NULL,
    completion_date TIMESTAMP,
    status VARCHAR(50) NOT NULL,
    completion_attempts INTEGER DEFAULT 0,
    last_resubmission_date TIMESTAMP,
    target_identifier VARCHAR(255),
    target_method VARCHAR(255),
    target_class VARCHAR(255)
);

CREATE INDEX idx_event_publication_status ON event_publication(status);
CREATE INDEX idx_event_publication_listener_id ON event_publication(listener_id);
CREATE INDEX idx_event_publication_event_type ON event_publication(event_type);
