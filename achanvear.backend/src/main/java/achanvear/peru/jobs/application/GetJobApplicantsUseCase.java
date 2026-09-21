package achanvear.peru.jobs.application;

import achanvear.peru.jobs.application.dto.JobApplicationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Use case for retrieving applicants for a specific job post.
 * Allows companies to review candidates who applied to their job postings.
 */
public interface GetJobApplicantsUseCase {

    /**
     * Retrieves all applications for a given job post.
     *
     * @param jobPostId the job post ID
     * @param companyId the company ID for ownership verification
     * @param superAdmin whether the requester is super admin
     * @param pageable pagination parameters
     * @return paginated list of job applications
     */
    Page<JobApplicationResponse> execute(String jobPostId, String companyId, boolean superAdmin, Pageable pageable);
}
