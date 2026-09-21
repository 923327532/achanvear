package achanvear.peru.interview.application;

import achanvear.peru.interview.application.command.StartInterviewSessionCommand;
import achanvear.peru.interview.application.dto.InterviewSessionResponse;

public interface StartInterviewSessionUseCase {

    InterviewSessionResponse execute(StartInterviewSessionCommand command);
}