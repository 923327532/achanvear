package achanvear.peru.jobs.application.impl;

import achanvear.peru.jobs.application.ApplyToJobUseCase;
import achanvear.peru.jobs.application.ChangeJobStatusUseCase;
import achanvear.peru.jobs.application.CreateJobUseCase;
import achanvear.peru.jobs.application.DeleteJobUseCase;
import achanvear.peru.jobs.application.GetJobApplicantsUseCase;
import achanvear.peru.jobs.application.GetJobByIdUseCase;
import achanvear.peru.jobs.application.GetMyJobPostsUseCase;
import achanvear.peru.jobs.application.SearchJobsUseCase;
import achanvear.peru.jobs.application.UpdateApplicationStatusUseCase;
import achanvear.peru.jobs.application.UpdateJobUseCase;
import achanvear.peru.jobs.application.command.ApplyJobCommand;
import achanvear.peru.jobs.application.command.ChangeJobStatusCommand;
import achanvear.peru.jobs.application.command.CreateJobCommand;
import achanvear.peru.jobs.application.command.UpdateApplicationStatusCommand;
import achanvear.peru.jobs.application.command.UpdateJobCommand;
import achanvear.peru.jobs.application.dto.JobApplicationResponse;
import achanvear.peru.jobs.application.dto.JobPostPageResponse;
import achanvear.peru.jobs.application.dto.JobPostResponse;
import achanvear.peru.shared.application.port.CompanyLookupPort;
import achanvear.peru.shared.application.port.IdentityCandidateLookupPort;
import achanvear.peru.jobs.application.query.JobSearchQuery;
import achanvear.peru.jobs.domain.factory.JobPostFactory;
import achanvear.peru.jobs.domain.model.ApplicationStatus;
import achanvear.peru.jobs.domain.model.JobApplication;
import achanvear.peru.jobs.domain.model.JobPost;
import achanvear.peru.jobs.domain.model.JobPostId;
import achanvear.peru.jobs.domain.model.JobStatus;
import achanvear.peru.jobs.domain.model.JobType;
import achanvear.peru.jobs.domain.model.NotificationTiming;
import achanvear.peru.jobs.domain.model.RecruitmentAutomationConfig;
import achanvear.peru.jobs.domain.model.RecruitmentAutomationLevel;
import achanvear.peru.jobs.domain.repository.ApplicationRepository;
import achanvear.peru.jobs.domain.repository.JobPostRepository;
import achanvear.peru.jobs.domain.repository.RecruitmentAutomationConfigRepository;
import achanvear.peru.jobs.infrastructure.persistence.JobApplicationMapper;
import achanvear.peru.shared.domain.exception.ResourceNotFoundException;
import achanvear.peru.shared.exception.BusinessRuleViolationException;
import achanvear.peru.shared.exception.ForbiddenOperationException;
import achanvear.peru.shared.application.EventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class JobApplicationService implements
        CreateJobUseCase,
        ApplyToJobUseCase,
        SearchJobsUseCase,
        GetJobByIdUseCase,
        UpdateJobUseCase,
        ChangeJobStatusUseCase,
        GetMyJobPostsUseCase,
        GetJobApplicantsUseCase,
        UpdateApplicationStatusUseCase,
        DeleteJobUseCase {

    private final JobPostRepository jobPostRepository;
    private final ApplicationRepository applicationRepository;
    private final JobPostFactory jobPostFactory;
    private final CompanyLookupPort companyLookupPort;
    private final IdentityCandidateLookupPort identityCandidateLookupPort;
    private final EventPublisher eventPublisher;
    private final JobApplicationMapper jobApplicationMapper;
    private final RecruitmentAutomationConfigRepository automationConfigRepository;

    public JobApplicationService(
            JobPostRepository jobPostRepository,
            ApplicationRepository applicationRepository,
            JobPostFactory jobPostFactory,
            CompanyLookupPort companyLookupPort,
            IdentityCandidateLookupPort identityCandidateLookupPort,
            EventPublisher eventPublisher,
            JobApplicationMapper jobApplicationMapper,
            RecruitmentAutomationConfigRepository automationConfigRepository
    ) {
        this.jobPostRepository = jobPostRepository;
        this.applicationRepository = applicationRepository;
        this.jobPostFactory = jobPostFactory;
        this.companyLookupPort = companyLookupPort;
        this.identityCandidateLookupPort = identityCandidateLookupPort;
        this.eventPublisher = eventPublisher;
        this.jobApplicationMapper = jobApplicationMapper;
        this.automationConfigRepository = automationConfigRepository;
    }

    @Override
    public JobPostResponse execute(CreateJobCommand command) {
        if (command.companyId() == null || command.companyId().isBlank()) {
            throw new BusinessRuleViolationException("Company id is required to create a job post");
        }

        UUID companyId = UUID.fromString(command.companyId());

        CompanyLookupPort.CompanySummary company = companyLookupPort.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        validateCompanyForPublishing(company, companyId);

        if (jobPostRepository.existsByTitleAndCompanyId(command.title().trim(), companyId)) {
            throw new BusinessRuleViolationException("Company already has a job post with the same title");
        }

        JobPost jobPost = jobPostFactory.create(
                companyId,
                command.title(),
                command.description(),
                command.location(),
                JobType.valueOf(command.type().trim().toUpperCase()),
                command.salaryMin(),
                command.salaryMax(),
                command.currency(),
                command.vacancies(),
                command.requirements(),
                command.closingMode(),
                command.closingDate(),
                command.maxApplicants()
        );

        jobPostRepository.save(jobPost);
        jobPost.pullDomainEvents().forEach(eventPublisher::publish);

        // Create recruitment automation config if selectionMode is provided
        if (command.selectionMode() != null && !command.selectionMode().isBlank()) {
            RecruitmentAutomationLevel level;
            try {
                level = RecruitmentAutomationLevel.valueOf(command.selectionMode().trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                level = RecruitmentAutomationLevel.MANUAL;
            }

            NotificationTiming timing = command.notificationTiming() != null
                    ? NotificationTiming.valueOf(command.notificationTiming().trim().toUpperCase())
                    : NotificationTiming.IMMEDIATE;

            RecruitmentAutomationConfig autoConfig = RecruitmentAutomationConfig.create(
                    jobPost.getId().value(),
                    level,
                    timing
            );

            // If fully automated, set screening criteria from command
            if (level == RecruitmentAutomationLevel.FULLY_AUTOMATED) {
                java.util.Map<String, String> criteria = new java.util.HashMap<>();
                if (command.maxCandidatesForScreening() != null) {
                    criteria.put("maxCandidatesForScreening", command.maxCandidatesForScreening().toString());
                }
                if (command.candidatesForTheoryInterview() != null) {
                    criteria.put("candidatesForTheoryInterview", command.candidatesForTheoryInterview().toString());
                }
                if (command.minimumScore() != null) {
                    criteria.put("minimumScore", command.minimumScore().toString());
                }
                if (!criteria.isEmpty()) {
                    autoConfig.updateScreeningCriteria(criteria);
                }
            }

            automationConfigRepository.save(autoConfig);
        }

        return jobApplicationMapper.toResponse(jobPost);
    }

    @Override
    public JobPostResponse execute(ApplyJobCommand command) {
        JobPost jobPost = jobPostRepository.findById(JobPostId.from(command.jobPostId()))
                .orElseThrow(() -> new ResourceNotFoundException("Job post not found"));

        UUID candidateUserId = UUID.fromString(command.candidateUserId());
        IdentityCandidateLookupPort.CandidateSummary candidate = identityCandidateLookupPort.findById(candidateUserId);

        validateCandidateForApplication(candidate, candidateUserId, command.candidateRole());

        jobPost.apply(candidateUserId, command.cvUrl(), command.coverLetter());

        jobPostRepository.save(jobPost);
        jobPost.pullDomainEvents().forEach(eventPublisher::publish);

        return jobApplicationMapper.toResponse(jobPost);
    }

    @Override
    @Transactional(readOnly = true)
    public JobPostPageResponse execute(JobSearchQuery query) {
        Page<JobPost> page = jobPostRepository.search(query);
        return jobApplicationMapper.toPageResponse(page);
    }

    @Override
    @Transactional(readOnly = true)
    public JobPostResponse execute(String jobPostId) {
        JobPost jobPost = jobPostRepository.findById(JobPostId.from(jobPostId))
                .orElseThrow(() -> new ResourceNotFoundException("Job post not found"));

        return jobApplicationMapper.toResponse(jobPost);
    }

    @Override
    public JobPostResponse execute(UpdateJobCommand command) {
        JobPost jobPost = jobPostRepository.findById(JobPostId.from(command.jobPostId()))
                .orElseThrow(() -> new ResourceNotFoundException("Job post not found"));

        authorizeCompanyOwnership(jobPost, command.requesterCompanyId(), command.superAdmin());

        jobPost.update(
                command.title(),
                command.description(),
                command.location(),
                JobType.valueOf(command.type().trim().toUpperCase()),
                command.salaryMin(),
                command.salaryMax(),
                command.currency(),
                command.vacancies()
        );

        jobPostRepository.save(jobPost);

        return jobApplicationMapper.toResponse(jobPost);
    }

    @Override
    public JobPostResponse execute(ChangeJobStatusCommand command) {
        JobPost jobPost = jobPostRepository.findById(JobPostId.from(command.jobPostId()))
                .orElseThrow(() -> new ResourceNotFoundException("Job post not found"));

        authorizeCompanyOwnership(jobPost, command.requesterCompanyId(), command.superAdmin());

        JobStatus newStatus = JobStatus.valueOf(command.status().trim().toUpperCase());

        switch (newStatus) {
            case CLOSED -> jobPost.close();
            case SUSPENDED -> jobPost.suspend();
            case PUBLISHED -> jobPost.publish();
            case DRAFT -> throw new BusinessRuleViolationException("Draft status is not supported in this flow");
        }

        jobPostRepository.save(jobPost);

        return jobApplicationMapper.toResponse(jobPost);
    }

    private void validateCompanyForPublishing(
            CompanyLookupPort.CompanySummary company,
            UUID companyId
    ) {
        if (company == null) {
            throw new ResourceNotFoundException("Company not found");
        }

        if (!companyId.equals(company.id())) {
            throw new BusinessRuleViolationException("Company data mismatch");
        }

        if (!"VALIDATED".equalsIgnoreCase(company.status())) {
            throw new BusinessRuleViolationException("Only validated companies can publish job posts");
        }
    }

    private void validateCandidateForApplication(
            IdentityCandidateLookupPort.CandidateSummary candidate,
            UUID candidateUserId,
            String candidateRole
    ) {
        if (candidate == null) {
            throw new ResourceNotFoundException("Candidate user not found");
        }

        if (!candidateUserId.equals(candidate.id())) {
            throw new BusinessRuleViolationException("Candidate data mismatch");
        }

        if (!"ACTIVE".equalsIgnoreCase(candidate.status())) {
            throw new BusinessRuleViolationException("Candidate user must be active");
        }

        if (!"FREELANCER".equalsIgnoreCase(candidate.role())) {
            throw new ForbiddenOperationException("Only freelancers can apply to job posts");
        }

        if (candidateRole != null && !candidateRole.isBlank() &&
                !candidate.role().equalsIgnoreCase(candidateRole.trim())) {
            throw new BusinessRuleViolationException("Candidate role does not match authenticated role");
        }
    }

    private void authorizeCompanyOwnership(JobPost jobPost, String requesterCompanyId, boolean superAdmin) {
        if (superAdmin) {
            return;
        }

        if (requesterCompanyId == null || requesterCompanyId.isBlank()) {
            throw new ForbiddenOperationException("Company context is required for this operation");
        }

        if (!jobPost.belongsTo(UUID.fromString(requesterCompanyId))) {
            throw new ForbiddenOperationException("You do not have permission to manage this job post");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public JobPostPageResponse execute(JobSearchQuery query, String companyId) {
        if (companyId == null || companyId.isBlank()) {
            throw new BusinessRuleViolationException("Company id is required");
        }

        UUID companyUuid = UUID.fromString(companyId);
        Pageable pageable = org.springframework.data.domain.PageRequest.of(
                query.page(),
                query.size(),
                org.springframework.data.domain.Sort.by(
                        org.springframework.data.domain.Sort.Direction.fromString(query.sortDirection()),
                        query.sortBy()
                )
        );

        Page<JobPost> page = jobPostRepository.findByCompanyId(companyUuid, pageable);
        return jobApplicationMapper.toPageResponse(page);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobApplicationResponse> execute(String jobPostId, String companyId, boolean superAdmin, Pageable pageable) {
        JobPost jobPost = jobPostRepository.findById(JobPostId.from(jobPostId))
                .orElseThrow(() -> new ResourceNotFoundException("Job post not found"));

        authorizeCompanyOwnership(jobPost, companyId, superAdmin);

        Page<JobApplication> applications = applicationRepository.findByJobPostId(
                UUID.fromString(jobPostId), pageable);

        return applications.map(this::toApplicationResponse);
    }

    @Override
    public JobApplicationResponse execute(UpdateApplicationStatusCommand command) {
        JobPost jobPost = jobPostRepository.findById(JobPostId.from(command.jobPostId()))
                .orElseThrow(() -> new ResourceNotFoundException("Job post not found"));

        authorizeCompanyOwnership(jobPost, command.companyId(), command.superAdmin());

        JobApplication application = applicationRepository.findById(UUID.fromString(command.applicationId()))
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        ApplicationStatus newStatus = ApplicationStatus.valueOf(command.newStatus().trim().toUpperCase());
        application.changeStatus(newStatus);

        applicationRepository.save(application);

        return toApplicationResponse(application);
    }

    @Override
    public void execute(String jobPostId, String requesterCompanyId, boolean superAdmin) {
        JobPost jobPost = jobPostRepository.findById(JobPostId.from(jobPostId))
                .orElseThrow(() -> new ResourceNotFoundException("Job post not found"));

        authorizeCompanyOwnership(jobPost, requesterCompanyId, superAdmin);

        jobPostRepository.deleteById(JobPostId.from(jobPostId));
    }

    private JobApplicationResponse toApplicationResponse(JobApplication application) {
        IdentityCandidateLookupPort.CandidateSummary candidate =
                identityCandidateLookupPort.findById(application.getCandidateUserId());

        return new JobApplicationResponse(
                application.getId().toString(),
                application.getCandidateUserId(),
                candidate != null ? candidate.fullName() : "Unknown",
                candidate != null ? candidate.email() : "Unknown",
                application.getCvUrl(),
                application.getCoverLetter(),
                application.getAppliedAt(),
                application.getStatus().name()
        );
    }
}