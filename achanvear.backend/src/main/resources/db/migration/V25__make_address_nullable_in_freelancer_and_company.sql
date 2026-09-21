-- Hacer address nullable en freelancer_profiles
ALTER TABLE freelancer_profiles ALTER COLUMN address DROP NOT NULL;

-- Hacer address nullable en companies
ALTER TABLE companies ALTER COLUMN address DROP NOT NULL;
