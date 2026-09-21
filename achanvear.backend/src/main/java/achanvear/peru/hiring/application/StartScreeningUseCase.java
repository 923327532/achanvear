package achanvear.peru.hiring.application;

import achanvear.peru.hiring.application.command.StartScreeningCommand;
import achanvear.peru.hiring.application.dto.ScreeningResultResponse;

public interface StartScreeningUseCase {

    ScreeningResultResponse execute(StartScreeningCommand command);
}