package achanvear.peru.jobs.application;

import achanvear.peru.jobs.application.dto.CompanyHiringStatsResponse;

public interface GetCompanyHiringStatsUseCase {

    CompanyHiringStatsResponse execute(String companyId);
}
