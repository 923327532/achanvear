package achanvear.peru.jobs.application.command;

public record ApplyJobCommand(
        String jobPostId,
        String candidateUserId,
        String candidateRole,
        String cvUrl,
        String coverLetter
) {
}