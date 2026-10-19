package achanvear.peru.company.application.impl;

import achanvear.peru.company.application.dto.CompanyPageResponse;
import achanvear.peru.company.application.dto.CompanyResponse;
import achanvear.peru.company.domain.model.Company;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

@Component
public class CompanyApplicationMapper {

    private final achanvear.peru.profile.TalentProfileRepository profileRepository;

    public CompanyApplicationMapper(achanvear.peru.profile.TalentProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    public CompanyResponse toResponse(Company company) {
        return CompanyResponse.from(company, profileRepository.findByUserId(company.getOwnerUserId()).orElse(null));
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
