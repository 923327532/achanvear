package achanvear.peru.jobs.application.impl;

import achanvear.peru.interview.application.GetInterviewReportUseCase;
import achanvear.peru.interview.application.dto.InterviewReportResponse;
import achanvear.peru.interview.application.port.InterviewReportQueryPort;
import achanvear.peru.jobs.application.GetCandidateDrawerDetailUseCase;
import achanvear.peru.jobs.application.GetCandidateInterviewReportsUseCase;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class CandidateInterviewReportsService implements GetCandidateInterviewReportsUseCase {
    private final GetCandidateDrawerDetailUseCase candidates;
    private final GetInterviewReportUseCase reports;
    private final InterviewReportQueryPort queries;

    public CandidateInterviewReportsService(GetCandidateDrawerDetailUseCase candidates,
            GetInterviewReportUseCase reports, InterviewReportQueryPort queries) {
        this.candidates = candidates;
        this.reports = reports;
        this.queries = queries;
    }

    @Override
    public List<InterviewReportResponse> execute(String jobId, String applicationId,
            String companyId, boolean administrator) {
        var candidate = candidates.execute(jobId, applicationId, companyId, administrator);
        var ids = queries.findCompletedIds(candidate.candidateUserId(), jobId, candidate.hiringProcessId());
        var jobTitle = queries.findJobTitle(jobId);
        return ids.stream()
                .map(reports::execute)
                .map(report -> report.withCandidateContext(jobTitle, candidate.candidateName()))
                .toList();
    }
}
