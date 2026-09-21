package achanvear.peru.company.domain.factory;

import achanvear.peru.company.domain.model.Company;
import achanvear.peru.company.domain.model.CompanyId;
import achanvear.peru.company.domain.model.CompanyPlan;
import achanvear.peru.company.domain.model.CompanySize;
import achanvear.peru.company.domain.model.CompanyStatus;
import achanvear.peru.company.domain.model.PaymentMethodType;
import achanvear.peru.company.domain.model.RepresentativeDni;
import achanvear.peru.company.domain.model.Ruc;

import java.util.UUID;

public class CompanyFactory {

    public Company create(
            UUID ownerUserId,
            String businessName,
            String tradeName,
            String legalName,
            String industry,
            String specialty,
            CompanySize companySize,
            String logoUrl,
            String biography,
            String achievements,
            String address,
            PaymentMethodType paymentMethodType,
            CompanyPlan companyPlan,
            RepresentativeDni representativeDni,
            Ruc ruc,
            CompanyStatus initialStatus
    ) {
        return Company.create(
                CompanyId.generate(),
                ownerUserId,
                businessName,
                tradeName,
                legalName,
                industry,
                specialty,
                companySize,
                logoUrl,
                biography,
                achievements,
                address,
                paymentMethodType,
                companyPlan,
                representativeDni,
                ruc,
                initialStatus
        );
    }
}