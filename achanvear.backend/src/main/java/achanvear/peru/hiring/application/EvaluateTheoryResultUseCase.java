package achanvear.peru.hiring.application;

import achanvear.peru.hiring.application.command.EvaluateTheoryResultCommand;
import achanvear.peru.hiring.application.dto.ScreeningResultResponse;

public interface EvaluateTheoryResultUseCase {

    ScreeningResultResponse execute(EvaluateTheoryResultCommand command);
}