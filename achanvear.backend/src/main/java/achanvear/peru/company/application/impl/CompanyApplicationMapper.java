package achanvear.peru.company.application.impl;

import achanvear.peru.company.application.dto.CompanyPageResponse;
import achanvear.peru.company.application.dto.CompanyResponse;
import achanvear.peru.company.domain.model.Company;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

@Component
public class CompanyApplicationMapper {

    public CompanyResponse toResponse(Company company) {
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
                company.getStatus().name()
        );
    }

    public CompanyPageResponse toPageResponse(Page<Company> page) {
        return new CompanyPageResponse(
                page.getContent().stream().map(this::toResponse).toList(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.getNumber(),
                page.getSize(),
                page.isFirst(),
                page.isLast()
        );
    }
}