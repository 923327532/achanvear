package achanvear.peru.company.infrastructure.adapter;

import achanvear.peru.company.infrastructure.persistence.CompanyJpaEntity;
import achanvear.peru.company.infrastructure.persistence.CompanyJpaRepository;
import achanvear.peru.shared.application.port.CompanyLookupPort;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

@Component
public class CompanyLookupAdapter implements CompanyLookupPort {

    private final CompanyJpaRepository companyJpaRepository;

    private final achanvear.peru.profile.TalentProfileRepository profileRepository;

    public CompanyLookupAdapter(CompanyJpaRepository companyJpaRepository, achanvear.peru.profile.TalentProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
        this.companyJpaRepository = companyJpaRepository;
    }

    @Override
    public Optional<CompanySummary> findById(UUID companyId) {
        return companyJpaRepository.findById(companyId)
                .map(this::toSummary);
    }

    @Override
    public Optional<CompanySummary> findByOwnerUserId(UUID ownerUserId) {
        return companyJpaRepository.findByOwnerUserId(ownerUserId)
                .map(this::toSummary);
    }

    private CompanySummary toSummary(CompanyJpaEntity company) {
        var score = profileRepository.findByUserId(company.getOwnerUserId())
            .map(p -> achanvear.peru.profile.domain.model.ReputationScore.fromRatings(p.getRatings()))
            .orElse(achanvear.peru.profile.domain.model.ReputationScore.empty());
        return new CompanySummary(
                company.getId(),
                company.getBusinessName(),
                company.getTradeName(),
                company.getIndustry(),
                company.getSpecialty(),
                company.getCompanySize(),
                company.getLogoUrl(),
                company.getStatus(),
                company.getOwnerUserId(),
                company.getCompanyPlan(),
                company.getCreatedAt(),
                score.averageStars().doubleValue(),
                score.totalRatings(),
                0    // publishedProjectsCount
        );
    }
}
