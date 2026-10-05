package achanvear.peru.jobs.application.impl;

import achanvear.peru.jobs.application.GetCompanyHiringStatsUseCase;
import achanvear.peru.jobs.application.dto.CompanyHiringStatsResponse;
import achanvear.peru.jobs.application.port.out.CompanyHiringStatsQueryPort;
import achanvear.peru.shared.exception.BusinessRuleViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class CompanyHiringStatsService implements GetCompanyHiringStatsUseCase {

    private final CompanyHiringStatsQueryPort companyHiringStatsQueryPort;

    public CompanyHiringStatsService(CompanyHiringStatsQueryPort companyHiringStatsQueryPort) {
        this.companyHiringStatsQueryPort = companyHiringStatsQueryPort;
    }

    @Override
    public CompanyHiringStatsResponse execute(String companyId) {
        if (companyId == null || companyId.isBlank()) {
            throw new BusinessRuleViolationException("Company id is required");
        }

        return companyHiringStatsQueryPort.getForCompany(UUID.fromString(companyId));
    }
}
