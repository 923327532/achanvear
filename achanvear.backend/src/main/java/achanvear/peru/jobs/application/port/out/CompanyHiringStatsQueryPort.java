package achanvear.peru.jobs.application.port.out;

import achanvear.peru.jobs.application.dto.CompanyHiringStatsResponse;

import java.util.UUID;

public interface CompanyHiringStatsQueryPort {

    CompanyHiringStatsResponse getForCompany(UUID companyId);
}
