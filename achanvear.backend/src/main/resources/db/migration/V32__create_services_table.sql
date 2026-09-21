-- Create services table for freelancer professional services
CREATE TABLE services (
    id UUID PRIMARY KEY,
    freelancer_user_id UUID NOT NULL,
    title VARCHAR(150) NOT NULL,
    description VARCHAR(5000) NOT NULL,
    category VARCHAR(50) NOT NULL,
    base_price NUMERIC(12, 2) NOT NULL,
    delivery_days INTEGER NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    views INTEGER NOT NULL DEFAULT 0,
    sales INTEGER NOT NULL DEFAULT 0,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 0.00,
    review_count INTEGER NOT NULL DEFAULT 0,
    image_urls TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_services_freelancer_user
        FOREIGN KEY (freelancer_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_services_freelancer_user_id ON services(freelancer_user_id);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_status ON services(status);
