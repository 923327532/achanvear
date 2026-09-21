package achanvear.peru.interview.application;

import achanvear.peru.interview.application.dto.InterviewScheduleResponse;

public interface GenerateScheduleUseCase {

    InterviewScheduleResponse execute(GenerateScheduleCommand command);
}
