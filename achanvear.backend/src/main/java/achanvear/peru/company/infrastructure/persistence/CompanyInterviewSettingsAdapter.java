package achanvear.peru.company.infrastructure.persistence;

import achanvear.peru.shared.application.port.CompanyInterviewSettingsPort;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public class CompanyInterviewSettingsAdapter implements CompanyInterviewSettingsPort {
    private final CompanyJpaRepository companies;

    public CompanyInterviewSettingsAdapter(CompanyJpaRepository companies) {
        this.companies = companies;
    }

    @Override
    public String selectedAgent(UUID companyId) {
        return companies.findById(companyId).orElseThrow().getAiAgentId();
    }
}
