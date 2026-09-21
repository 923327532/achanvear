package achanvear.peru.interview.application;

import achanvear.peru.interview.application.dto.InterviewReportResponse;

public interface GetInterviewReportUseCase {
    InterviewReportResponse execute(String interviewId);
}
