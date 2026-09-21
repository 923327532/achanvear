package achanvear.peru.company.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateCompanyRequest(
        @NotBlank @Size(min = 3, max = 150) String businessName,
        String tradeName,
        @NotBlank @Size(min = 3, max = 180) String legalName,
        @NotBlank @Size(min = 2, max = 120) String industry,
        @NotBlank @Size(min = 2, max = 120) String specialty,
        @NotBlank String companySize,
        String logoUrl,
        @NotBlank @Size(min = 10, max = 1500) String biography,
        @Size(max = 1500) String achievements,
        @NotBlank @Size(min = 5, max = 255) String address,
        @NotBlank String paymentMethodType,
        @NotBlank String companyPlan
) {
}