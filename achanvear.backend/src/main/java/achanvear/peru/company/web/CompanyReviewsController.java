package achanvear.peru.company.web;

import achanvear.peru.company.application.dto.CompanyResponse;
import achanvear.peru.company.application.impl.CompanyApplicationMapper;
import achanvear.peru.company.domain.repository.CompanyRepository;
import achanvear.peru.company.domain.model.CompanyId;
import achanvear.peru.freelance.infrastructure.persistence.FreelanceProjectJpaRepository;
import achanvear.peru.freelance.domain.model.ProjectStatus;
import achanvear.peru.profile.TalentProfile;
import achanvear.peru.profile.TalentProfileRepository;
import achanvear.peru.profile.ProfileType;
import achanvear.peru.profile.domain.model.RatingTargetType;
import achanvear.peru.shared.domain.exception.ResourceNotFoundException;
import achanvear.peru.shared.exception.ForbiddenOperationException;
import achanvear.peru.shared.security.AuthenticatedUser;
import achanvear.peru.shared.web.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Size;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/companies")
public class CompanyReviewsController {
    private final CompanyRepository companies;
    private final TalentProfileRepository profiles;
    private final FreelanceProjectJpaRepository projects;
    private final CompanyApplicationMapper mapper;

    public CompanyReviewsController(CompanyRepository companies, TalentProfileRepository profiles,
            FreelanceProjectJpaRepository projects, CompanyApplicationMapper mapper) {
        this.companies = companies;
        this.profiles = profiles;
        this.projects = projects;
        this.mapper = mapper;
    }

    public record ReviewRequest(@Min(1) @Max(5) int stars, boolean recommended,
                                @Size(max = 1000) String comment) {}

    @PostMapping("/{companyId}/ratings")
    @PreAuthorize("hasAuthority('FREELANCER')")
    @Transactional
    public ApiResponse<CompanyResponse> rate(@PathVariable String companyId,
            @AuthenticationPrincipal AuthenticatedUser user, @Valid @RequestBody ReviewRequest request) {
        var company = companies.findById(CompanyId.from(companyId))
                .orElseThrow(() -> new ResourceNotFoundException("Company not found"));
        if (!projects.existsByClientUserIdAndSelectedFreelancerUserIdAndStatus(
                company.getOwnerUserId(), user.getUserId(), ProjectStatus.COMPLETED)) {
            throw new ForbiddenOperationException("Solo puedes calificar empresas con las que completaste un proyecto");
        }
        var profile = profiles.findByUserId(company.getOwnerUserId()).orElseGet(() -> TalentProfile.create(
                company.getOwnerUserId(), ProfileType.COMPANY, "Empresa " + company.getBusinessName(),
                "Perfil de empresa para opiniones de profesionales y freelancers.", company.getAddress(),
                company.getLogoUrl(), null, List.of(), List.of()));
        if (profile.getProfileType() != ProfileType.COMPANY) {
            profile.updateProfile(ProfileType.COMPANY, profile.getHeadline(), profile.getBiography(),
                    profile.getLocation(), profile.getProfilePhotoUrl(), profile.getCurriculumUrl(),
                    profile.getSkills(), profile.getPortfolioItems());
        }
        profile.addRating(user.getUserId(), RatingTargetType.FREELANCER, request.stars(),
                request.recommended(), request.comment());
        profiles.save(profile);
        return ApiResponse.success(mapper.toResponse(company), "Company review saved");
    }
}
