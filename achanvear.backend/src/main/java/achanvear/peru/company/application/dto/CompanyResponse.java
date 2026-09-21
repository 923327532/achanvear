package achanvear.peru.company.application.dto;

import achanvear.peru.company.domain.model.Company;

public record CompanyResponse(
        String id,
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
        String ruc,
        String status,
        String name) {

    public static CompanyResponse from(Company company) {
        return new CompanyResponse(
                company.getId().toString(),
                company.getOwnerUserId().toString(),
                company.getBusinessName(),
                company.getTradeName(),
                company.getLegalName(),
                company.getIndustry(),
                company.getSpecialty(),
                company.getCompanySize().name(),
                company.getLogoUrl(),
                company.getBiography(),
                company.getAchievements(),
                company.getAddress(),
                company.getPaymentMethodType().name(),
                company.getCompanyPlan().name(),
                company.getRepresentativeDni().value(),
                company.getRuc() != null ? company.getRuc().value() : null,
                company.getStatus().name(),
                company.getStatus().name());
    }
}
