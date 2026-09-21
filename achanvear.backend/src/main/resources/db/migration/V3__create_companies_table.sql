CREATE TABLE companies (
                           id UUID PRIMARY KEY,
                           owner_user_id UUID NOT NULL UNIQUE,
                           business_name VARCHAR(150) NOT NULL UNIQUE,
                           trade_name VARCHAR(150),
                           legal_name VARCHAR(180) NOT NULL,
                           industry VARCHAR(120) NOT NULL,
                           specialty VARCHAR(120) NOT NULL,
                           company_size VARCHAR(40) NOT NULL,
                           logo_url VARCHAR(500),
                           biography VARCHAR(1500) NOT NULL,
                           achievements VARCHAR(1500),
                           address VARCHAR(255) NOT NULL,
                           payment_method_type VARCHAR(40) NOT NULL,
                           company_plan VARCHAR(40) NOT NULL,
                           representative_dni VARCHAR(8) NOT NULL,
                           ruc VARCHAR(11),
                           status VARCHAR(30) NOT NULL,
                           created_at TIMESTAMP WITH TIME ZONE NOT NULL,
                           updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_companies_owner_user_id ON companies(owner_user_id);
CREATE INDEX idx_companies_status ON companies(status);
CREATE INDEX idx_companies_industry ON companies(industry);
CREATE INDEX idx_companies_company_size ON companies(company_size);
CREATE INDEX idx_companies_company_plan ON companies(company_plan);
CREATE INDEX idx_companies_created_at ON companies(created_at);