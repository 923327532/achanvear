package achanvear.peru.jobs.application;

import achanvear.peru.jobs.application.dto.JobPostPageResponse;
import achanvear.peru.jobs.application.query.JobSearchQuery;

/**
 * Use case for retrieving job posts owned by the authenticated company.
 * Allows companies to manage their own job listings.
 */
public interface GetMyJobPostsUseCase {

    /**
     * Retrieves job posts filtered by company ID with pagination.
     *
     * @param query search filters and pagination parameters
     * @param companyId the company ID to filter by
     * @return paginated list of job posts belonging to the company
     */
    JobPostPageResponse execute(JobSearchQuery query, String companyId);
}
