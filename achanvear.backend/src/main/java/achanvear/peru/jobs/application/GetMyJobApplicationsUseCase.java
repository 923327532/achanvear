package achanvear.peru.jobs.application;

import achanvear.peru.jobs.application.dto.MyJobApplicationResponse;
import achanvear.peru.jobs.domain.model.JobApplication;
import achanvear.peru.jobs.domain.model.JobPost;
import achanvear.peru.jobs.domain.model.JobPostId;
import achanvear.peru.jobs.domain.repository.ApplicationRepository;
import achanvear.peru.jobs.domain.repository.JobPostRepository;
import achanvear.peru.shared.application.port.CompanyLookupPort;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class GetMyJobApplicationsUseCase {

    private final ApplicationRepository applicationRepository;
    private final JobPostRepository jobPostRepository;
    private final CompanyLookupPort companyLookupPort;

    public GetMyJobApplicationsUseCase(
            ApplicationRepository applicationRepository,
            JobPostRepository jobPostRepository,
            CompanyLookupPort companyLookupPort
    ) {
        this.applicationRepository = applicationRepository;
        this.jobPostRepository = jobPostRepository;
        this.companyLookupPort = companyLookupPort;
    }

    @Transactional(readOnly = true)
    public Page<MyJobApplicationResponse> execute(UUID candidateUserId, Pageable pageable) {
        return applicationRepository.findByCandidateUserId(candidateUserId, pageable)
                .map(this::toResponse);
    }

    private MyJobApplicationResponse toResponse(JobApplication application) {
        JobPost jobPost = jobPostRepository.findById(JobPostId.from(application.getJobPostId().toString()))
                .orElse(null);

        String jobTitle = jobPost != null ? jobPost.getTitle() : "Vacante";
        String companyName = jobPost != null
                ? companyLookupPort.findById(jobPost.getCompanyId())
                        .map(company -> company.tradeName() != null && !company.tradeName().isBlank()
                                ? company.tradeName()
                                : company.businessName())
                        .orElse("Empresa")
                : "Empresa";

        return new MyJobApplicationResponse(
                application.getId().toString(),
                application.getJobPostId().toString(),
                jobTitle,
                companyName,
                application.getAppliedAt(),
                jobPost != null ? jobPost.getSelectionMode().name() : null,
                application.getStatus().name(),
                application.getStatus().name(),
                application.getScreeningScore(),
                application.getScreeningResult(),
                application.getScreeningSummary()
        );
    }
}
