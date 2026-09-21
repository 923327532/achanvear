package achanvear.peru.jobs.application;

import achanvear.peru.jobs.application.command.ConfigureAutomationCommand;
import achanvear.peru.jobs.application.dto.RecruitmentAutomationConfigResponse;

/**
 * Use case for managing recruitment automation configuration.
 * Allows companies to configure manual, semi-automated or fully automated recruitment.
 */
public interface ManageRecruitmentAutomationUseCase {

    /**
     * Retrieves automation configuration for a job post.
     *
     * @param jobPostId the job post id
     * @param companyId the company id for authorization
     * @param superAdmin whether requester is super admin
     * @return the automation configuration response
     */
    RecruitmentAutomationConfigResponse getConfig(String jobPostId, String companyId, boolean superAdmin);

    /**
     * Configures automation for a job post.
     *
     * @param command the configuration command
     * @return the updated configuration response
     */
    RecruitmentAutomationConfigResponse configure(ConfigureAutomationCommand command);
}
