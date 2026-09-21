package achanvear.peru.jobs.application.command;

public record ChangeJobStatusCommand(
        String jobPostId,
        String requesterCompanyId,
        boolean superAdmin,
        String status
) {
}