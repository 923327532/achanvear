package achanvear.peru.company.application.command;

public record CreateCompanyCommand(
        String ownerUserId,
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
        String companyPlan,
        String representativeDni,
        String ruc
) {
}