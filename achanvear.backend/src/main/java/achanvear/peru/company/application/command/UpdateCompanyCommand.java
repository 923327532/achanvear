package achanvear.peru.company.application.command;

public record UpdateCompanyCommand(
        String companyId,
        String requesterUserId,
        boolean superAdmin,
        String businessName,
        String tradeName,
        String legalName,
        String industry,
        String specialty,
        String companySize,
        String logoUrl,
        String biography,
        String achievements,
        String address,
        String paymentMethodType,
        String companyPlan
) {
}