package achanvear.peru.jobs.web;

import achanvear.peru.jobs.application.GetCandidateInterviewReportsUseCase;
import achanvear.peru.interview.application.dto.InterviewReportResponse;
import achanvear.peru.shared.security.AuthenticatedUser;
import achanvear.peru.shared.web.ApiResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/jobs/{jobId}/applicants/{applicationId}/interview-reports")
public class CandidateInterviewReportsController {
    private final GetCandidateInterviewReportsUseCase reports;

    public CandidateInterviewReportsController(GetCandidateInterviewReportsUseCase reports) {
        this.reports = reports;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('COMPANY','COMPANY_COLLABORATOR','SUPERADMIN')")
    public ApiResponse<List<InterviewReportResponse>> get(@PathVariable String jobId,
            @PathVariable String applicationId, @AuthenticationPrincipal AuthenticatedUser principal) {
        var companyId = principal.getCompanyId() == null ? null : principal.getCompanyId().toString();
        var result = reports.execute(jobId, applicationId, companyId, principal.isSuperAdmin());
        return ApiResponse.success(result, "Informes de entrevistas finalizadas");
    }
}
