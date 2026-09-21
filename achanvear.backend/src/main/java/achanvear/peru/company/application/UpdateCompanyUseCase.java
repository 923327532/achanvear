package achanvear.peru.company.application;

import achanvear.peru.company.application.command.UpdateCompanyCommand;
import achanvear.peru.company.application.dto.CompanyResponse;

public interface UpdateCompanyUseCase {

    CompanyResponse execute(UpdateCompanyCommand command);
}