CREATE TABLE service_conversation_origins (
 conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
 service_id UUID NOT NULL REFERENCES services(id), PRIMARY KEY(conversation_id,service_id)
);
CREATE TABLE service_contracts (
 id UUID PRIMARY KEY, project_id UUID NOT NULL UNIQUE REFERENCES freelance_projects(id),
 service_id UUID NOT NULL REFERENCES services(id), plan_id UUID REFERENCES service_plans(id) ON DELETE SET NULL,
 conversation_id UUID NOT NULL REFERENCES chat_conversations(id),
 client_user_id UUID NOT NULL REFERENCES users(id), freelancer_user_id UUID NOT NULL REFERENCES users(id),
 milestone_id UUID NOT NULL UNIQUE, title VARCHAR(150) NOT NULL, plan_name VARCHAR(150) NOT NULL,
 amount NUMERIC(12,2) NOT NULL CHECK(amount>0), delivery_days INTEGER NOT NULL CHECK(delivery_days>0),
 currency VARCHAR(3) NOT NULL CHECK(currency='PEN'),
 status VARCHAR(25) NOT NULL CHECK(status IN ('PENDING_ACCEPTANCE','ACCEPTED','COMPLETED','REJECTED')),
 idempotency_key UUID NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE(client_user_id,idempotency_key)
);
CREATE INDEX service_contracts_conversation ON service_contracts(conversation_id);
CREATE TABLE service_contract_reviews (
 contract_id UUID PRIMARY KEY REFERENCES service_contracts(id), reviewer_user_id UUID NOT NULL REFERENCES users(id),
 stars INTEGER NOT NULL CHECK(stars BETWEEN 1 AND 5), comment VARCHAR(1000),
 created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
