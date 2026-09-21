package achanvear.peru.jobs.web;

import achanvear.peru.jobs.application.ApplyToJobUseCase;
import achanvear.peru.jobs.application.ChangeJobStatusUseCase;
import achanvear.peru.jobs.application.CreateJobUseCase;
import achanvear.peru.jobs.application.DeleteJobUseCase;
import achanvear.peru.jobs.application.GetCandidateDrawerDetailUseCase;
import achanvear.peru.jobs.application.GetAppliedJobIdsUseCase;
import achanvear.peru.jobs.application.GetJobApplicantsUseCase;
import achanvear.peru.jobs.application.GetJobByIdUseCase;
import achanvear.peru.jobs.application.GetMyJobPostsUseCase;
import achanvear.peru.jobs.application.JobAiSuggestionService;
import achanvear.peru.jobs.application.ManageRecruitmentAutomationUseCase;
import achanvear.peru.jobs.application.SearchJobsUseCase;
import achanvear.peru.jobs.application.UpdateApplicationStatusUseCase;
import achanvear.peru.jobs.application.UpdateJobUseCase;
import achanvear.peru.jobs.application.command.ApplyJobCommand;
import achanvear.peru.jobs.application.command.ChangeJobStatusCommand;
import achanvear.peru.jobs.application.command.ConfigureAutomationCommand;
import achanvear.peru.jobs.application.command.CreateJobCommand;
import achanvear.peru.jobs.application.command.UpdateApplicationStatusCommand;
import achanvear.peru.jobs.application.command.UpdateJobCommand;
import achanvear.peru.jobs.application.dto.CandidateDrawerDetailResponse;
import achanvear.peru.jobs.application.dto.JobAiSuggestionResponse;
import achanvear.peru.jobs.application.dto.JobApplicationResponse;
import achanvear.peru.jobs.application.dto.JobPostPageResponse;
import achanvear.peru.jobs.application.dto.JobPostResponse;
import achanvear.peru.jobs.application.dto.RecruitmentAutomationConfigResponse;
import achanvear.peru.jobs.application.query.JobSearchQuery;
import achanvear.peru.jobs.web.request.AdvanceCandidateRequest;
import java.time.Instant;
import achanvear.peru.jobs.web.request.ApplyJobRequest;
import achanvear.peru.jobs.web.request.ChangeJobStatusRequest;
import achanvear.peru.jobs.web.request.ConfigureAutomationRequest;
import achanvear.peru.jobs.web.request.CreateJobRequest;
import achanvear.peru.jobs.web.request.JobAiSuggestionRequest;
import achanvear.peru.jobs.web.request.UpdateApplicationStatusRequest;
import achanvear.peru.jobs.web.request.UpdateJobRequest;
import achanvear.peru.shared.exception.BusinessRuleViolationException;
import achanvear.peru.shared.security.AuthenticatedUser;
import achanvear.peru.shared.web.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/jobs")
public class JobController {

    private final CreateJobUseCase createJobUseCase;
    private final ApplyToJobUseCase applyToJobUseCase;
    private final SearchJobsUseCase searchJobsUseCase;
    private final GetJobByIdUseCase getJobByIdUseCase;
    private final UpdateJobUseCase updateJobUseCase;
    private final ChangeJobStatusUseCase changeJobStatusUseCase;
    private final GetMyJobPostsUseCase getMyJobPostsUseCase;
    private final GetJobApplicantsUseCase getJobApplicantsUseCase;
    private final UpdateApplicationStatusUseCase updateApplicationStatusUseCase;
    private final ManageRecruitmentAutomationUseCase manageRecruitmentAutomationUseCase;
    private final DeleteJobUseCase deleteJobUseCase;
    private final GetCandidateDrawerDetailUseCase getCandidateDrawerDetailUseCase;
    private final GetAppliedJobIdsUseCase getAppliedJobIdsUseCase;
    private final JobAiSuggestionService jobAiSuggestionService;

    public JobController(
            CreateJobUseCase createJobUseCase,
            ApplyToJobUseCase applyToJobUseCase,
            SearchJobsUseCase searchJobsUseCase,
            GetJobByIdUseCase getJobByIdUseCase,
            UpdateJobUseCase updateJobUseCase,
            ChangeJobStatusUseCase changeJobStatusUseCase,
            GetMyJobPostsUseCase getMyJobPostsUseCase,
            GetJobApplicantsUseCase getJobApplicantsUseCase,
            UpdateApplicationStatusUseCase updateApplicationStatusUseCase,
            ManageRecruitmentAutomationUseCase manageRecruitmentAutomationUseCase,
            DeleteJobUseCase deleteJobUseCase,
            GetCandidateDrawerDetailUseCase getCandidateDrawerDetailUseCase,
            GetAppliedJobIdsUseCase getAppliedJobIdsUseCase,
            JobAiSuggestionService jobAiSuggestionService
    ) {
        this.getAppliedJobIdsUseCase = getAppliedJobIdsUseCase;
        this.jobAiSuggestionService = jobAiSuggestionService;

        this.createJobUseCase = createJobUseCase;
        this.applyToJobUseCase = applyToJobUseCase;
        this.searchJobsUseCase = searchJobsUseCase;
        this.getJobByIdUseCase = getJobByIdUseCase;
        this.updateJobUseCase = updateJobUseCase;
        this.changeJobStatusUseCase = changeJobStatusUseCase;
        this.getMyJobPostsUseCase = getMyJobPostsUseCase;
        this.getJobApplicantsUseCase = getJobApplicantsUseCase;
        this.updateApplicationStatusUseCase = updateApplicationStatusUseCase;
        this.manageRecruitmentAutomationUseCase = manageRecruitmentAutomationUseCase;
        this.deleteJobUseCase = deleteJobUseCase;
        this.getCandidateDrawerDetailUseCase = getCandidateDrawerDetailUseCase;
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('COMPANY', 'COMPANY_COLLABORATOR', 'SUPERADMIN')")
    public ResponseEntity<ApiResponse<JobPostResponse>> createJob(
            @Valid @RequestBody CreateJobRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        String companyId = resolveCompanyId(principal);

        Instant closingDate = request.closingDate() != null
                ? Instant.parse(request.closingDate())
                : null;

        CreateJobCommand command = new CreateJobCommand(
                companyId,
                request.title(),
                request.description(),
                request.location(),
                request.type(),
                request.salaryMin(),
                request.salaryMax(),
                request.currency(),
                request.vacancies(),
                request.requirements(),
                request.selectionMode(),
                request.hideSalary(),
                request.maxCandidatesForScreening(),
                request.candidatesForTheoryInterview(),
                request.minimumScore(),
                request.closingMode(),
                closingDate,
                request.maxApplicants(),
                request.notificationTiming()
        );

        JobPostResponse response = createJobUseCase.execute(command);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Job post created successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<JobPostPageResponse>> searchJobs(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String companyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection
    ) {
        JobSearchQuery query = new JobSearchQuery(
                search,
                location,
                type,
                status,
                companyId,
                page,
                size,
                sortBy,
                sortDirection
        );

        JobPostPageResponse response = searchJobsUseCase.execute(query);

        return ResponseEntity.ok(ApiResponse.success(response, "Jobs retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<JobPostResponse>> getJobById(@PathVariable String id) {
        JobPostResponse response = getJobByIdUseCase.execute(id);

        return ResponseEntity.ok(ApiResponse.success(response, "Job post retrieved successfully"));
    }

    @PostMapping("/{id}/apply")
    @PreAuthorize("hasAnyAuthority('FREELANCER')")
    public ResponseEntity<ApiResponse<JobPostResponse>> applyToJob(
            @PathVariable String id,
            @Valid @RequestBody ApplyJobRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        ApplyJobCommand command = new ApplyJobCommand(
                id,
                principal.getUserId().toString(),
                principal.getRole(),
                request.cvUrl(),
                request.coverLetter()
        );

        JobPostResponse response = applyToJobUseCase.execute(command);

        return ResponseEntity.ok(ApiResponse.success(response, "Application submitted successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('COMPANY', 'COMPANY_COLLABORATOR', 'SUPERADMIN')")
    public ResponseEntity<ApiResponse<JobPostResponse>> updateJob(
            @PathVariable String id,
            @Valid @RequestBody UpdateJobRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        UpdateJobCommand command = new UpdateJobCommand(
                id,
                resolveCompanyId(principal),
                principal.isSuperAdmin(),
                request.title(),
                request.description(),
                request.location(),
                request.type(),
                request.salaryMin(),
                request.salaryMax(),
                request.currency(),
                request.vacancies()
        );

        JobPostResponse response = updateJobUseCase.execute(command);

        return ResponseEntity.ok(ApiResponse.success(response, "Job post updated successfully"));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('COMPANY', 'COMPANY_COLLABORATOR', 'SUPERADMIN')")
    public ResponseEntity<ApiResponse<JobPostResponse>> changeJobStatus(
            @PathVariable String id,
            @Valid @RequestBody ChangeJobStatusRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        ChangeJobStatusCommand command = new ChangeJobStatusCommand(
                id,
                resolveCompanyId(principal),
                principal.isSuperAdmin(),
                request.status()
        );

        JobPostResponse response = changeJobStatusUseCase.execute(command);

        return ResponseEntity.ok(ApiResponse.success(response, "Job post status updated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('COMPANY', 'COMPANY_COLLABORATOR', 'SUPERADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteJob(
            @PathVariable String id,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        deleteJobUseCase.execute(
                id,
                resolveCompanyId(principal),
                principal.isSuperAdmin()
        );

        return ResponseEntity.ok(ApiResponse.success(null, "Job post deleted successfully"));
    }

    @GetMapping("/my-posts")
    @PreAuthorize("hasAnyAuthority('COMPANY', 'COMPANY_COLLABORATOR', 'SUPERADMIN')")
    public ResponseEntity<ApiResponse<JobPostPageResponse>> getMyJobPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        // Si el usuario COMPANY no tiene compañía asignada, devolver lista vacía
        if (principal.getCompanyId() == null) {
            JobPostPageResponse emptyResponse = new JobPostPageResponse(
                    java.util.Collections.emptyList(),
                    0L,
                    0,
                    0,
                    size,
                    true,
                    true
            );
            return ResponseEntity.ok(ApiResponse.success(emptyResponse, "No company assigned yet"));
        }

        String companyId = resolveCompanyId(principal);

        JobSearchQuery query = new JobSearchQuery(
                null,
                null,
                null,
                null,
                companyId,
                page,
                size,
                sortBy,
                sortDirection
        );

        JobPostPageResponse response = getMyJobPostsUseCase.execute(query, companyId);

        return ResponseEntity.ok(ApiResponse.success(response, "My job posts retrieved successfully"));
    }

    @GetMapping("/{id}/applicants")
    @PreAuthorize("hasAnyAuthority('COMPANY', 'COMPANY_COLLABORATOR', 'SUPERADMIN')")
    public ResponseEntity<ApiResponse<Page<JobApplicationResponse>>> getJobApplicants(
            @PathVariable String id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "appliedAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        String companyId = resolveCompanyId(principal);

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.fromString(sortDirection), sortBy)
        );

        Page<JobApplicationResponse> response = getJobApplicantsUseCase.execute(
                id,
                companyId,
                principal.isSuperAdmin(),
                pageable
        );

        return ResponseEntity.ok(ApiResponse.success(response, "Applicants retrieved successfully"));
    }

    @PatchMapping("/{jobPostId}/applicants/{applicationId}/status")
    @PreAuthorize("hasAnyAuthority('COMPANY', 'COMPANY_COLLABORATOR', 'SUPERADMIN')")
    public ResponseEntity<ApiResponse<JobApplicationResponse>> updateApplicationStatus(
            @PathVariable String jobPostId,
            @PathVariable String applicationId,
            @Valid @RequestBody UpdateApplicationStatusRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        UpdateApplicationStatusCommand command = new UpdateApplicationStatusCommand(
                applicationId,
                jobPostId,
                resolveCompanyId(principal),
                principal.isSuperAdmin(),
                request.newStatus()
        );

        JobApplicationResponse response = updateApplicationStatusUseCase.execute(command);

        return ResponseEntity.ok(ApiResponse.success(response, "Application status updated successfully"));
    }

    @PutMapping("/{id}/automation")
    @PreAuthorize("hasAnyAuthority('COMPANY', 'COMPANY_COLLABORATOR', 'SUPERADMIN')")
    public ResponseEntity<ApiResponse<RecruitmentAutomationConfigResponse>> configureAutomation(
            @PathVariable String id,
            @Valid @RequestBody ConfigureAutomationRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        String companyId = resolveCompanyId(principal);

        ConfigureAutomationCommand command = new ConfigureAutomationCommand(
                id,
                companyId,
                principal.isSuperAdmin(),
                request.automationLevel(),
                request.autoSendInterviewInvites(),
                request.autoInterviewTimeoutMinutes(),
                request.screeningCriteria(),
                request.webhookUrl(),
                request.notificationTiming()
        );

        RecruitmentAutomationConfigResponse response = manageRecruitmentAutomationUseCase.configure(command);

        return ResponseEntity.ok(ApiResponse.success(response, "Automation configured successfully"));
    }

    @GetMapping("/applied-ids")
    @PreAuthorize("hasAnyAuthority('FREELANCER')")
    public ResponseEntity<ApiResponse<java.util.List<String>>> getAppliedJobIds(
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        java.util.List<String> ids = getAppliedJobIdsUseCase.execute(principal.getUserId());
        return ResponseEntity.ok(ApiResponse.success(ids, "Applied job IDs retrieved successfully"));
    }

    @GetMapping("/{id}/automation")
    @PreAuthorize("hasAnyAuthority('COMPANY', 'COMPANY_COLLABORATOR', 'SUPERADMIN')")
    public ResponseEntity<ApiResponse<RecruitmentAutomationConfigResponse>> getAutomationConfig(

            @PathVariable String id,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        String companyId = resolveCompanyId(principal);

        RecruitmentAutomationConfigResponse response = manageRecruitmentAutomationUseCase.getConfig(
                id,
                companyId,
                principal.isSuperAdmin()
        );

        return ResponseEntity.ok(ApiResponse.success(response, "Automation configuration retrieved"));
    }

    @GetMapping("/{jobPostId}/applicants/{applicationId}/detail")
    @PreAuthorize("hasAnyAuthority('COMPANY', 'COMPANY_COLLABORATOR', 'SUPERADMIN')")
    public ResponseEntity<ApiResponse<CandidateDrawerDetailResponse>> getCandidateDrawerDetail(
            @PathVariable String jobPostId,
            @PathVariable String applicationId,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        String companyId = resolveCompanyId(principal);

        CandidateDrawerDetailResponse response = getCandidateDrawerDetailUseCase.execute(
                jobPostId,
                applicationId,
                companyId,
                principal.isSuperAdmin()
        );

        return ResponseEntity.ok(ApiResponse.success(response, "Candidate detail retrieved successfully"));
    }

    @PostMapping("/{jobPostId}/applicants/{applicationId}/advance")
    @PreAuthorize("hasAnyAuthority('COMPANY', 'COMPANY_COLLABORATOR', 'SUPERADMIN')")
    public ResponseEntity<ApiResponse<JobApplicationResponse>> advanceCandidate(
            @PathVariable String jobPostId,
            @PathVariable String applicationId,
            @Valid @RequestBody AdvanceCandidateRequest request,
            @AuthenticationPrincipal AuthenticatedUser principal
    ) {
        String companyId = resolveCompanyId(principal);

        // Map the action to the corresponding application status
        String newStatus;
        if ("ADVANCE".equalsIgnoreCase(request.action())) {
            newStatus = "IN_REVIEW";
        } else if ("REJECT".equalsIgnoreCase(request.action())) {
            newStatus = "REJECTED";
        } else {
            throw new BusinessRuleViolationException("Invalid action: " + request.action() + ". Must be ADVANCE or REJECT");
        }

        UpdateApplicationStatusCommand command = new UpdateApplicationStatusCommand(
                applicationId,
                jobPostId,
                companyId,
                principal.isSuperAdmin(),
                newStatus
        );

        JobApplicationResponse response = updateApplicationStatusUseCase.execute(command);

        return ResponseEntity.ok(ApiResponse.success(response, "Candidate " + request.action().toLowerCase() + "d successfully"));
    }

    @PostMapping("/ai-suggest")
    @PreAuthorize("hasAnyAuthority('COMPANY', 'COMPANY_COLLABORATOR', 'SUPERADMIN')")
    public ResponseEntity<ApiResponse<JobAiSuggestionResponse>> aiSuggest(
            @Valid @RequestBody JobAiSuggestionRequest request
    ) {
        JobAiSuggestionResponse response = jobAiSuggestionService.suggest(request.prompt());
        return ResponseEntity.ok(ApiResponse.success(response, "Sugerencia generada exitosamente"));
    }

    private String resolveCompanyId(AuthenticatedUser principal) {
        if (principal.isSuperAdmin()) {
            return principal.getCompanyId() == null ? null : principal.getCompanyId().toString();
        }

        if (principal.getCompanyId() == null) {
            throw new BusinessRuleViolationException("Authenticated company user does not have a company assigned");
        }

        return principal.getCompanyId().toString();
    }
}
