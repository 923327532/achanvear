package achanvear.peru.interview.application;

import achanvear.peru.interview.application.command.CompleteInterviewCommand;
import achanvear.peru.interview.application.dto.InterviewReportResponse;

public interface CompleteInterviewUseCase {
    InterviewReportResponse execute(CompleteInterviewCommand command);
}