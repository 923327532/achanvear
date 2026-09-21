package achanvear.peru.jobs.application;

import achanvear.peru.jobs.application.command.UpdateApplicationStatusCommand;
import achanvear.peru.jobs.application.dto.JobApplicationResponse;

/**
 * Use case for updating the status of a job application.
 * Allows companies to manage their recruitment pipeline.
 * Status transitions: SUBMITTED -> IN_REVIEW -> SHORTLISTED/REJECTED -> HIRED
 */
public interface UpdateApplicationStatusUseCase {

    /**
     * Updates the status of a job application.
     *
     * @param command the update command with new status
     * @return the updated job application response
     */
    JobApplicationResponse execute(UpdateApplicationStatusCommand command);
}
