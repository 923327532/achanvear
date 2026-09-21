package achanvear.peru.company.application;

import achanvear.peru.company.application.command.DeactivateCompanyCommand;

public interface DeactivateCompanyUseCase {

    void execute(DeactivateCompanyCommand command);
}