package achanvear.peru.company.infrastructure.persistence;

import achanvear.peru.company.domain.model.*;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CompanyMapper {

    default Company toDomain(CompanyJpaEntity entity) {
        if (entity == null) {
            return null;
        }

        return Company.restore(
                new CompanyId(entity.getId()),
                entity.getOwnerUserId(),
                entity.getBusinessName(),
                entity.getTradeName(),
                entity.getLegalName(),
                entity.getIndustry(),
                entity.getSpecialty(),
                CompanySize.valueOf(entity.getCompanySize()),
                entity.getLogoUrl(),
                entity.getBiography(),
                entity.getAchievements(),
                entity.getAddress(),
                PaymentMethodType.valueOf(entity.getPaymentMethodType()),
                CompanyPlan.valueOf(entity.getCompanyPlan()),
                new RepresentativeDni(entity.getRepresentativeDni()),
                entity.getRuc() != null ? new Ruc(entity.getRuc()) : null,
                CompanyStatus.valueOf(entity.getStatus())
        );
    }

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    @Mapping(target = "id", expression = "java(company.getId().value())")
    @Mapping(target = "companySize", expression = "java(company.getCompanySize().name())")
    @Mapping(target = "paymentMethodType", expression = "java(company.getPaymentMethodType().name())")
    @Mapping(target = "companyPlan", expression = "java(company.getCompanyPlan().name())")
    @Mapping(target = "representativeDni", expression = "java(company.getRepresentativeDni().value())")
    @Mapping(target = "ruc", expression = "java(company.getRuc() != null ? company.getRuc().value() : null)")
    @Mapping(target = "status", expression = "java(company.getStatus().name())")
    CompanyJpaEntity toEntity(Company company);
}