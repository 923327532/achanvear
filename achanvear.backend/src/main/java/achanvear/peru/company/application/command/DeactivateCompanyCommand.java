package achanvear.peru.company.application.command;

public record DeactivateCompanyCommand(
        String companyId,
        String requesterUserId,
        boolean superAdmin
) {
}