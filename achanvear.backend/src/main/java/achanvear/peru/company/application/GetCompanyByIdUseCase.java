package achanvear.peru.company.application;

import achanvear.peru.company.application.dto.CompanyResponse;

public interface GetCompanyByIdUseCase {

    CompanyResponse execute(String companyId);
}