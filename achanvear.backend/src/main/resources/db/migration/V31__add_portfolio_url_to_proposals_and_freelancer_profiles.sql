-- Add portfolio_url column to freelance_proposals
ALTER TABLE freelance_proposals
    ADD COLUMN portfolio_url TEXT;

-- Add portfolio_url column to freelancer_profiles
ALTER TABLE freelancer_profiles
    ADD COLUMN portfolio_url TEXT;
