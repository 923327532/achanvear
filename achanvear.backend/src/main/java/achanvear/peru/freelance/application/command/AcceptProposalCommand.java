package achanvear.peru.freelance.application.command;

public record AcceptProposalCommand(
        String projectId,
        String proposalId,
        String requesterClientUserId
) {
}