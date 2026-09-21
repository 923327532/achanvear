CREATE TABLE freelancer_profiles (
                                     id UUID PRIMARY KEY,
                                     user_id UUID NOT NULL UNIQUE,
                                     name VARCHAR(150) NOT NULL,
                                     industry VARCHAR(120) NOT NULL,
                                     specialty VARCHAR(120) NOT NULL,
                                     profile_photo_url TEXT,
                                     biography VARCHAR(2000) NOT NULL,
                                     achievements VARCHAR(2000),
                                     address VARCHAR(255) NOT NULL,
                                     payment_method_type VARCHAR(30) NOT NULL,
                                     dni VARCHAR(8) NOT NULL UNIQUE,
                                     curriculum_url TEXT,
                                     status VARCHAR(30) NOT NULL,
                                     created_at TIMESTAMP NOT NULL,
                                     updated_at TIMESTAMP NOT NULL
);

CREATE TABLE freelancer_certifications (
                                           freelancer_id UUID NOT NULL,
                                           name VARCHAR(150) NOT NULL,
                                           issuing_organization VARCHAR(150) NOT NULL,
                                           credential_url TEXT,
                                           CONSTRAINT fk_freelancer_certifications_profile
                                               FOREIGN KEY (freelancer_id) REFERENCES freelancer_profiles(id) ON DELETE CASCADE
);

CREATE TABLE freelance_projects (
                                    id UUID PRIMARY KEY,
                                    client_user_id UUID NOT NULL,
                                    title VARCHAR(150) NOT NULL,
                                    description VARCHAR(5000) NOT NULL,
                                    category VARCHAR(120) NOT NULL,
                                    budget NUMERIC(12, 2) NOT NULL,
                                    estimated_days INTEGER NOT NULL,
                                    status VARCHAR(30) NOT NULL,
                                    selected_freelancer_user_id UUID,
                                    created_at TIMESTAMP NOT NULL,
                                    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE freelance_proposals (
                                     id UUID PRIMARY KEY,
                                     project_id UUID NOT NULL,
                                     freelancer_user_id UUID NOT NULL,
                                     cover_letter VARCHAR(2000) NOT NULL,
                                     proposed_budget NUMERIC(12, 2) NOT NULL,
                                     estimated_days INTEGER NOT NULL,
                                     submitted_at TIMESTAMP NOT NULL,
                                     status VARCHAR(30) NOT NULL,
                                     CONSTRAINT fk_freelance_proposals_project
                                         FOREIGN KEY (project_id) REFERENCES freelance_projects(id) ON DELETE CASCADE
);

CREATE TABLE freelance_milestones (
                                      id UUID PRIMARY KEY,
                                      project_id UUID NOT NULL,
                                      title VARCHAR(150) NOT NULL,
                                      description VARCHAR(1000) NOT NULL,
                                      amount NUMERIC(12, 2) NOT NULL,
                                      status VARCHAR(30) NOT NULL,
                                      CONSTRAINT fk_freelance_milestones_project
                                          FOREIGN KEY (project_id) REFERENCES freelance_projects(id) ON DELETE CASCADE
);

CREATE INDEX idx_freelance_projects_status ON freelance_projects(status);
CREATE INDEX idx_freelance_projects_category ON freelance_projects(category);
CREATE INDEX idx_freelance_projects_client_user_id ON freelance_projects(client_user_id);
CREATE INDEX idx_freelance_proposals_project_id ON freelance_proposals(project_id);
CREATE INDEX idx_freelance_proposals_freelancer_user_id ON freelance_proposals(freelancer_user_id);