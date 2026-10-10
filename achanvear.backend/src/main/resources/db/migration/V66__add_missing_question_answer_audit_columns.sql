ALTER TABLE questions
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

UPDATE questions
SET created_at = NOW()
WHERE created_at IS NULL;

ALTER TABLE answers
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

UPDATE answers
SET created_at = NOW()
WHERE created_at IS NULL;

ALTER TABLE answers
    ADD COLUMN IF NOT EXISTS answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

UPDATE answers
SET answered_at = COALESCE(answered_at, created_at, NOW())
WHERE answered_at IS NULL;
