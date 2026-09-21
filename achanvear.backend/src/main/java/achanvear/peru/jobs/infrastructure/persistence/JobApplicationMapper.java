package achanvear.peru.jobs.infrastructure.persistence;

import achanvear.peru.jobs.application.dto.ApplicationResponse;
import achanvear.peru.jobs.application.dto.CompanySummaryResponse;
import achanvear.peru.jobs.application.dto.JobPostPageResponse;
import achanvear.peru.jobs.application.dto.JobPostResponse;
import achanvear.peru.shared.application.port.CompanyLookupPort;
import achanvear.peru.jobs.domain.model.JobApplication;
import achanvear.peru.jobs.domain.model.JobPost;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Component
public class JobApplicationMapper {

    private final CompanyLookupPort companyLookupPort;

    public JobApplicationMapper(CompanyLookupPort companyLookupPort) {
        this.companyLookupPort = companyLookupPort;
    }

    public JobPostResponse toResponse(JobPost jobPost) {
        CompanyLookupPort.CompanySummary companySummary = companyLookupPort.findById(jobPost.getCompanyId())
                .orElse(null);

        CompanySummaryResponse company = companySummary == null
                ? null
                : new CompanySummaryResponse(
                companySummary.id().toString(),
                companySummary.businessName(),
                companySummary.tradeName(),
                companySummary.industry(),
                companySummary.specialty(),
                companySummary.companySize(),
                companySummary.logoUrl(),
                companySummary.status()
        );

        return new JobPostResponse(
                jobPost.getId().toString(),
                jobPost.getCompanyId().toString(),
                company,
                jobPost.getTitle(),
                jobPost.getDescription(),
                jobPost.getLocation(),
                jobPost.getType().name(),
                jobPost.getSalaryMin(),
                jobPost.getSalaryMax(),
                jobPost.getCurrency(),
                jobPost.getVacancies(),
                jobPost.getRequirements(),
                jobPost.getStatus().name(),
                jobPost.getApplications().stream().map(this::toApplicationResponse).toList(),
                jobPost.getCreatedAt() != null
                        ? LocalDateTime.ofInstant(jobPost.getCreatedAt(), ZoneId.systemDefault())
                        : null,
                jobPost.getSelectionMode() != null ? jobPost.getSelectionMode().name() : null,
                jobPost.getMaxApplicants(),
                jobPost.getClosingDate(),
                jobPost.getSelectionMode() != null ? jobPost.getSelectionMode().name() : null
        );
    }

    public ApplicationResponse toApplicationResponse(JobApplication application) {
        return new ApplicationResponse(
                application.getId().toString(),
                application.getCandidateUserId().toString(),
                application.getCvUrl(),
                application.getCoverLetter(),
                application.getAppliedAt(),
                application.getStatus().name()
        );
    }

    public JobPostPageResponse toPageResponse(Page<JobPost> page) {
        return new JobPostPageResponse(
                page.getContent().stream().map(this::toResponse).toList(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.getNumber(),
                page.getSize(),
                page.isFirst(),
                page.isLast()
        );
    }
}
