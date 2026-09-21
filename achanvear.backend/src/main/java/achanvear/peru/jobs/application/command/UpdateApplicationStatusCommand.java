package achanvear.peru.jobs.application.command;

/**
 * Command to update the status of a job application.
 * Used by companies to manage their recruitment pipeline.
 */
public record UpdateApplicationStatusCommand(
        String applicationId,
        String jobPostId,
        String companyId,
        boolean superAdmin,
        String newStatus
) {
}
