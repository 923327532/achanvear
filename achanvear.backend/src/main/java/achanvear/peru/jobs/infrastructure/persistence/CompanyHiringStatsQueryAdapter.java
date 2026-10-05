package achanvear.peru.jobs.infrastructure.persistence;

import achanvear.peru.interview.infrastructure.persistence.repository.InterviewJpaRepository;
import achanvear.peru.hiring.infrastructure.persistence.HiringProcessJpaRepository;
import achanvear.peru.jobs.application.dto.CompanyHiringStatsResponse;
import achanvear.peru.jobs.application.port.out.CompanyHiringStatsQueryPort;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public class CompanyHiringStatsQueryAdapter implements CompanyHiringStatsQueryPort {

    private static final String PUBLISHED = "PUBLISHED";
    private final JobPostJpaRepository jobPostJpaRepository;
    private final ApplicationJpaRepository applicationJpaRepository;
    private final InterviewJpaRepository interviewJpaRepository;
    private final HiringProcessJpaRepository hiringProcessJpaRepository;

    public CompanyHiringStatsQueryAdapter(
            JobPostJpaRepository jobPostJpaRepository,
            ApplicationJpaRepository applicationJpaRepository,
            InterviewJpaRepository interviewJpaRepository,
            HiringProcessJpaRepository hiringProcessJpaRepository
    ) {
        this.jobPostJpaRepository = jobPostJpaRepository;
        this.applicationJpaRepository = applicationJpaRepository;
        this.interviewJpaRepository = interviewJpaRepository;
        this.hiringProcessJpaRepository = hiringProcessJpaRepository;
    }

    @Override
    public CompanyHiringStatsResponse getForCompany(UUID companyId) {
        return new CompanyHiringStatsResponse(
                jobPostJpaRepository.countByCompanyIdAndStatus(companyId, PUBLISHED),
                applicationJpaRepository.countByCompanyId(companyId),
                interviewJpaRepository.countActiveForCompany(companyId),
                hiringProcessJpaRepository.countFinalistsByCompanyId(companyId)
        );
    }
}
