ALTER TABLE users
    ADD COLUMN full_name VARCHAR(255),
    ADD COLUMN dni VARCHAR(8);

CREATE INDEX idx_users_dni ON users(dni);