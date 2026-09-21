package achanvear.peru.company.application.command;

public record ChangeCompanyStatusCommand(
        String companyId,
        String requesterUserId,
        boolean superAdmin,
        String newStatus
) {
}