package achanvear.peru.interview.application;

import achanvear.peru.interview.application.command.SubmitAnswerCommand;
import achanvear.peru.interview.application.dto.SubmitAnswerResponse;

public interface SubmitAnswerUseCase {

    SubmitAnswerResponse execute(SubmitAnswerCommand command);
}