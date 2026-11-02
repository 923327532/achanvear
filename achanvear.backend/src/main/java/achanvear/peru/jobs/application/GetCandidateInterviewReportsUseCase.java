package achanvear.peru.jobs.application;

import achanvear.peru.interview.application.dto.InterviewReportResponse;
import java.util.List;

public interface GetCandidateInterviewReportsUseCase {
    List<InterviewReportResponse> execute(String jobId, String applicationId, String companyId, boolean administrator);
}
