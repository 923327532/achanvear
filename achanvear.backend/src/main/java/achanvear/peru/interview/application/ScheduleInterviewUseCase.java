package achanvear.peru.interview.application;

import achanvear.peru.interview.application.dto.InterviewSessionResponse;

public interface ScheduleInterviewUseCase {

    InterviewSessionResponse execute(ScheduleInterviewCommand command);
}