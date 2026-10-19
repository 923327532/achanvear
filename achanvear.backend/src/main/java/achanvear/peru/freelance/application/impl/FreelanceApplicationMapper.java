package achanvear.peru.freelance.application.impl;

import achanvear.peru.freelance.application.dto.*;
import achanvear.peru.freelance.domain.model.*;
import achanvear.peru.profile.TalentProfile;
import achanvear.peru.shared.application.port.CompanyLookupPort;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;
import java.util.Map;
import java.util.Collection;
import java.util.HashSet;
import achanvear.peru.freelance.domain.repository.FreelancerProfileRepository;

@Component
public class FreelanceApplicationMapper {

    private final CompanyLookupPort companyLookupPort;

    private final FreelancerProfileRepository freelancerProfiles;

    public FreelanceApplicationMapper(CompanyLookupPort companyLookupPort, FreelancerProfileRepository freelancerProfiles) {
        this.freelancerProfiles = freelancerProfiles;
        this.companyLookupPort = companyLookupPort;
    }

    public FreelancerProfileResponse toFreelancerProfileResponse(FreelancerProfile profile) {
        return toFreelancerProfileResponse(profile, null);
    }

    public FreelancerProfileResponse toFreelancerProfileResponse(FreelancerProfile profile, TalentProfile talentProfile) {
        // Datos del módulo freelance
        String id = profile.getId().toString();
        String userId = profile.getUserId().toString();
        String name = profile.getName();
        String industry = profile.getIndustry();
        String specialty = profile.getSpecialty();
        String profilePhotoUrl = profile.getProfilePhotoUrl();
        String bannerUrl = profile.getBannerUrl();
        String biography = profile.getBiography();
        String achievements = profile.getAchievements();
        String address = profile.getAddress();
        String paymentMethodType = profile.getPaymentMethodType().name();
        String dni = profile.getDni();
        String curriculumUrl = profile.getCurriculumUrl();
        String cvData = profile.getCvData();
        String status = profile.getStatus().name();

        List<FreelancerCertificationResponse> certifications = profile.getCertifications().stream()
                .map(this::toCertificationResponse)
                .toList();

        // Datos del módulo profile (TalentProfile)
        String headline = null;
        String location = null;
        FreelancerProfileResponse.ReputationScoreResponse reputationScore = null;
        List<FreelancerProfileResponse.SkillResponse> skills = null;
        List<FreelancerProfileResponse.PortfolioItemResponse> portfolioItems = null;
        List<FreelancerProfileResponse.ProfileRatingResponse> ratings = null;

        if (talentProfile != null) {
            headline = talentProfile.getHeadline();
            location = talentProfile.getLocation();

            if (talentProfile.getReputationScore() != null) {
                reputationScore = new FreelancerProfileResponse.ReputationScoreResponse(
                        talentProfile.getReputationScore().averageStars(),
                        talentProfile.getReputationScore().recommendationPercentage(),
                        talentProfile.getReputationScore().totalRatings()
                );
            }

            skills = talentProfile.getSkills().stream()
                    .map(skill -> new FreelancerProfileResponse.SkillResponse(
                            skill.getName(),
                            skill.getLevel().name(),
                            skill.getYearsOfExperience()
                    ))
                    .toList();

            portfolioItems = talentProfile.getPortfolioItems().stream()
                    .map(item -> new FreelancerProfileResponse.PortfolioItemResponse(
                            item.getTitle(),
                            item.getDescription(),
                            item.getAssetUrl(),
                            item.getProjectUrl()
                    ))
                    .toList();

            ratings = talentProfile.getRatings().stream()
                    .map(rating -> new FreelancerProfileResponse.ProfileRatingResponse(
                            rating.getReviewerUserId().toString(),
                            rating.getReviewerType().name(),
                            rating.getStars(),
                            rating.isRecommended(),
                            rating.getComment(),
                            rating.getCreatedAt()
                    ))
                    .toList();
        }

        return new FreelancerProfileResponse(
                id, userId, name, industry, specialty, profilePhotoUrl, bannerUrl,
                biography, achievements, address, paymentMethodType, dni,
                curriculumUrl, cvData, status, certifications,
                headline, location, reputationScore, skills, portfolioItems, ratings,
                profile.getAvailabilityStatus() != null ? profile.getAvailabilityStatus().name() : null,
                profile.getCvVisibility() != null ? profile.getCvVisibility().name() : null,
                profile.getPreferredCurrency() != null ? profile.getPreferredCurrency().name() : null,
                profile.getPreferredPaymentMethod() != null ? profile.getPreferredPaymentMethod().name() : null,
                profile.getLanguage(),
                profile.getTimezone(),
                profile.getNotificationPreferences()
        );

    }


    public FreelanceProjectResponse toProjectResponse(FreelanceProject project) {
        return toProjectResponse(project, null);
    }

    public FreelanceProjectResponse toProjectResponse(FreelanceProject project, UUID authenticatedUserId) {
        return toProjectResponse(project, authenticatedUserId, summaries(List.of(project)));
    }

    private Map<UUID, FreelancerProfileRepository.Summary> summaries(Collection<FreelanceProject> projects) {
        var ids = new HashSet<UUID>();
        for (var project : projects) {
            if (project.getSelectedFreelancerUserId() != null) ids.add(project.getSelectedFreelancerUserId());
            project.getProposals().forEach(p -> ids.add(p.getFreelancerUserId()));
        }
        return freelancerProfiles.findSummariesByUserIds(ids);
    }

    private FreelanceProjectResponse toProjectResponse(FreelanceProject project, UUID authenticatedUserId,
            Map<UUID, FreelancerProfileRepository.Summary> profiles) {
        var selected = project.getSelectedFreelancerUserId() == null ? null : profiles.get(project.getSelectedFreelancerUserId());
        // Obtener datos de la empresa usando map/orElse para evitar variables mutables en lambda
        CompanyLookupPort.CompanySummary company = (project.getClientUserId() != null)
                ? companyLookupPort.findByOwnerUserId(project.getClientUserId()).orElse(null)
                : null;

        String companyName = (company != null) ? company.businessName() : null;
        String companyInitials = (company != null) ? company.getInitials() : null;
        String companyLogoUrl = (company != null) ? company.logoUrl() : null;
        double companyRating = (company != null) ? company.averageRating() : 0.0;
        int publishedJobsCount = (company != null) ? company.publishedProjectsCount() : 0;

        boolean hasApplied = authenticatedUserId != null &&
                project.getProposals().stream()
                        .anyMatch(p -> p.getFreelancerUserId().equals(authenticatedUserId));

        return new FreelanceProjectResponse(
                project.getId().toString(),
                project.getClientUserId().toString(),
                project.getTitle(),
                project.getDescription(),
                project.getCategory(),
                project.getSubcategory(),
                project.getBudget(),
                project.getEstimatedDays(),
                project.getExperienceLevel(),
                project.getSkills(),
                project.getBudgetType(),
                project.getModality(),
                project.getProviderType(),
                project.getAttachments(),
                project.getStatus().name(),
                project.getSelectedFreelancerUserId() == null ? null : project.getSelectedFreelancerUserId().toString(),
                project.getProposals().stream().map(p -> toProposalResponse(p, profiles)).toList(),
                project.getMilestones().stream().map(this::toMilestoneResponse).toList(),
                project.getCreatedAt(),
                project.getCurrency(),
                project.getLanguage(),
                project.getMinBudget(),
                project.getMaxBudget(),
                project.getHourlyRateMin(),
                project.getHourlyRateMax(),
                companyName,
                companyInitials,
                companyLogoUrl,
                companyRating,
                publishedJobsCount,
                project.getProposals().size(),
                hasApplied,
                selected == null ? null : selected.name(),
                selected == null ? null : selected.profilePhotoUrl()
        );
    }

    public FreelanceProjectPageResponse toProjectPageResponse(Page<FreelanceProject> page) {
        return toProjectPageResponse(page, null);
    }

    public FreelanceProjectPageResponse toProjectPageResponse(Page<FreelanceProject> page, UUID authenticatedUserId) {
        var profiles = summaries(page.getContent());
        return new FreelanceProjectPageResponse(
                page.getContent().stream()
                        .map(p -> toProjectResponse(p, authenticatedUserId, profiles))
                        .toList(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.getNumber(),
                page.getSize(),
                page.isFirst(),
                page.isLast()
        );
    }

    private FreelancerCertificationResponse toCertificationResponse(FreelancerCertification certification) {
        return new FreelancerCertificationResponse(
                certification.getName(),
                certification.getIssuingOrganization(),
                certification.getCredentialUrl()
        );
    }

    private ProposalResponse toProposalResponse(Proposal proposal, Map<UUID, FreelancerProfileRepository.Summary> profiles) {
        var freelancer = profiles.get(proposal.getFreelancerUserId());
        return new ProposalResponse(
                proposal.getId().toString(),
                proposal.getFreelancerUserId().toString(),
                proposal.getCoverLetter(),
                proposal.getProposedBudget(),
                proposal.getEstimatedDays(),
                proposal.getPortfolioUrl(),
                proposal.getSubmittedAt(),
                proposal.getStatus().name(),
                freelancer == null ? null : freelancer.name(),
                freelancer == null ? null : freelancer.profilePhotoUrl()
        );
    }

    private MilestoneResponse toMilestoneResponse(Milestone milestone) {
        return new MilestoneResponse(
                milestone.getId().toString(),
                milestone.getTitle(),
                milestone.getDescription(),
                milestone.getAmount(),
                milestone.getStatus().name()
        );
    }
}
