package achanvear.peru.company.infrastructure.adapter;

import achanvear.peru.company.domain.model.Company;
import achanvear.peru.company.domain.model.CompanyId;
import achanvear.peru.company.domain.repository.CompanyRepository;
import achanvear.peru.shared.application.port.CompanyLookupPort;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
public class CompanyLookupAdapter implements CompanyLookupPort {

    private final CompanyRepository companyRepository;

    public CompanyLookupAdapter(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    @Override
    public Optional<CompanySummary> findById(UUID companyId) {
        return companyRepository.findById(new CompanyId(companyId))
                .map(this::toSummary);
    }

    @Override
    public Optional<CompanySummary> findByOwnerUserId(UUID ownerUserId) {
        return companyRepository.findByOwnerUserId(ownerUserId)
                .map(this::toSummary);
    }

    private CompanySummary toSummary(Company company) {
        return new CompanySummary(
                company.getId().value(),
                company.getBusinessName(),
                company.getTradeName(),
                company.getIndustry(),
                company.getSpecialty(),
                company.getCompanySize() != null ? company.getCompanySize().name() : null,
                company.getLogoUrl(),
                company.getStatus().name(),
                0.0, // averageRating
                0,   // totalRatings
                0    // publishedProjectsCount
        );
    }
}
