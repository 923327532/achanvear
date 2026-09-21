package achanvear.peru.company.application;

import achanvear.peru.company.application.command.CreateCompanyCommand;
import achanvear.peru.company.application.dto.CompanyResponse;

public interface CreateCompanyUseCase {

    CompanyResponse execute(CreateCompanyCommand command);
}