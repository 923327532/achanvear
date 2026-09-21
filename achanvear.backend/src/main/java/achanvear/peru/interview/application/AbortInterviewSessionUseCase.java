package achanvear.peru.interview.application;

import achanvear.peru.interview.application.command.AbortInterviewSessionCommand;

public interface AbortInterviewSessionUseCase {
    void execute(AbortInterviewSessionCommand command);
}
