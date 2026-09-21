package achanvear.peru.company.application;

import achanvear.peru.company.application.dto.CompanyResponse;

public interface GetCompanyByUserIdUseCase {
    CompanyResponse executeByUserId(String userId);
}
