package achanvear.peru.interview.application;

import achanvear.peru.interview.application.dto.InterviewSummaryResponse;

import java.util.List;

public interface GetMyInterviewsUseCase {
    List<InterviewSummaryResponse> getMyInterviews(String candidateId);
}
