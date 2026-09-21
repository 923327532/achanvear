package achanvear.peru.company.application;

import achanvear.peru.company.application.dto.CompanyPageResponse;
import achanvear.peru.company.application.query.CompanyListQuery;

public interface ListCompaniesUseCase {

    CompanyPageResponse execute(CompanyListQuery query);
}