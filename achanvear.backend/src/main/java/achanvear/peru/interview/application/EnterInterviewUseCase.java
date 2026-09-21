package achanvear.peru.interview.application;

import achanvear.peru.interview.application.dto.EnterInterviewResponse;

public interface EnterInterviewUseCase {

    EnterInterviewResponse execute(EnterInterviewCommand command);
}
