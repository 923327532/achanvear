package achanvear.peru.interview.application;

import achanvear.peru.interview.application.command.AbortInterviewCommand;

public interface AbortInterviewUseCase {
    void execute(AbortInterviewCommand command);
}
