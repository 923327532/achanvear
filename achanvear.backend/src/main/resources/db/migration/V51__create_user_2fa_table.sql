CREATE TABLE user_2fa (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    enabled BOOLEAN NOT NULL DEFAULT false,
    secret VARCHAR(255),
    method VARCHAR(50) DEFAULT 'TOTP',
    setup_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_2fa_user_id ON user_2fa(user_id);