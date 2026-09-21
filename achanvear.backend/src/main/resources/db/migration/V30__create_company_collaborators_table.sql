CREATE TABLE company_collaborators (
    id UUID PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    invited_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_company_collaborator_user UNIQUE (company_id, user_id),
    CONSTRAINT uq_collaborator_email UNIQUE (email)
);

CREATE INDEX idx_company_collaborators_company_id ON company_collaborators(company_id);
CREATE INDEX idx_company_collaborators_user_id ON company_collaborators(user_id);
