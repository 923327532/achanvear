ALTER TABLE freelancer_profiles
    ADD COLUMN IF NOT EXISTS availability_status VARCHAR(30),
    ADD COLUMN IF NOT EXISTS cv_visibility VARCHAR(30),
    ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(10),
    ADD COLUMN IF NOT EXISTS preferred_payment_method VARCHAR(20),
    ADD COLUMN IF NOT EXISTS language VARCHAR(10),
    ADD COLUMN IF NOT EXISTS timezone VARCHAR(50),
    ADD COLUMN IF NOT EXISTS notification_preferences TEXT;