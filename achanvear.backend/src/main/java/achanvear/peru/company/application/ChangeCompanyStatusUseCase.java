package achanvear.peru.company.application;

import achanvear.peru.company.application.command.ChangeCompanyStatusCommand;
import achanvear.peru.company.application.dto.CompanyResponse;

public interface ChangeCompanyStatusUseCase {

    CompanyResponse execute(ChangeCompanyStatusCommand command);
}