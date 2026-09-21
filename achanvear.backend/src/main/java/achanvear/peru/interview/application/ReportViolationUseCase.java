package achanvear.peru.interview.application;

import achanvear.peru.interview.application.command.ReportViolationCommand;

public interface ReportViolationUseCase {
    void execute(ReportViolationCommand command);
}
