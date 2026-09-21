package achanvear.peru.jobs.application;

import achanvear.peru.jobs.application.dto.CandidateDrawerDetailResponse;

/**
 * Use case for retrieving the detailed candidate information for the drawer.
 * Aggregates data from jobs, hiring, and interview modules.
 */
public interface GetCandidateDrawerDetailUseCase {

    /**
     * Retrieves the full detail of a candidate application for the drawer.
     *
     * @param jobId         the job post ID
     * @param applicationId the application ID
     * @param companyId     the company ID for ownership verification
     * @param superAdmin    whether the requester is super admin
     * @return the aggregated candidate drawer detail
     */
    CandidateDrawerDetailResponse execute(String jobId, String applicationId, String companyId, boolean superAdmin);
}
