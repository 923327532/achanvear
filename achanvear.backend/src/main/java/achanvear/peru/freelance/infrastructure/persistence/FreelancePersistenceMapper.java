package achanvear.peru.freelance.infrastructure.persistence;

import achanvear.peru.freelance.domain.model.*;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
public class FreelancePersistenceMapper {

    public FreelancerProfileJpaEntity toEntity(FreelancerProfile profile) {
        FreelancerProfileJpaEntity entity = new FreelancerProfileJpaEntity();
        entity.setId(profile.getId().value());
        entity.setUserId(profile.getUserId());
        entity.setName(profile.getName());
        entity.setIndustry(profile.getIndustry());
        entity.setSpecialty(profile.getSpecialty());
        entity.setProfilePhotoUrl(profile.getProfilePhotoUrl());
        entity.setBiography(profile.getBiography());
        entity.setAchievements(profile.getAchievements());
        entity.setAddress(profile.getAddress());
        entity.setPaymentMethodType(profile.getPaymentMethodType());
        entity.setDni(profile.getDni());
        entity.setCurriculumUrl(profile.getCurriculumUrl());
        entity.setCvData(profile.getCvData());
        entity.setStatus(profile.getStatus());

        entity.setCertifications(profile.getCertifications().stream().map(this::toEmbeddable).toList());

        entity.setAvailabilityStatus(profile.getAvailabilityStatus());
        entity.setCvVisibility(profile.getCvVisibility());
        entity.setPreferredCurrency(profile.getPreferredCurrency());
        entity.setPreferredPaymentMethod(profile.getPreferredPaymentMethod());
        entity.setLanguage(profile.getLanguage());
        entity.setTimezone(profile.getTimezone());
        entity.setNotificationPreferences(profile.getNotificationPreferences());
        return entity;
    }

    public FreelancerProfile toFreelancerProfileDomain(FreelancerProfileJpaEntity entity) {
        return FreelancerProfile.restore(
                new FreelancerId(entity.getId()),
                entity.getUserId(),
                entity.getName(),
                entity.getIndustry(),
                entity.getSpecialty(),
                entity.getProfilePhotoUrl(),
                entity.getBiography(),
                entity.getAchievements(),
                entity.getAddress(),
                entity.getPaymentMethodType(),
                entity.getDni(),
                entity.getCurriculumUrl(),
                entity.getCvData(),
                entity.getStatus(),
                entity.getCertifications().stream().map(this::toCertification).toList(),
                entity.getAvailabilityStatus(),
                entity.getCvVisibility(),
                entity.getPreferredCurrency(),
                entity.getPreferredPaymentMethod(),
                entity.getLanguage(),
                entity.getTimezone(),
                entity.getNotificationPreferences()
        );
    }


    public FreelanceProjectJpaEntity toEntity(FreelanceProject project) {
        FreelanceProjectJpaEntity entity = new FreelanceProjectJpaEntity();
        entity.setId(project.getId().value());
        entity.setClientUserId(project.getClientUserId());
        entity.setTitle(project.getTitle());
        entity.setDescription(project.getDescription());
        entity.setCategory(project.getCategory());
        entity.setSubcategory(project.getSubcategory());
        entity.setBudget(project.getBudget());
        entity.setEstimatedDays(project.getEstimatedDays());
        entity.setExperienceLevel(project.getExperienceLevel());
        entity.setSkills(project.getSkills().isEmpty() ? null : String.join(",", project.getSkills()));
        entity.setBudgetType(project.getBudgetType());
        entity.setModality(project.getModality());
        entity.setProviderType(project.getProviderType());
        entity.setAttachments(project.getAttachments().isEmpty() ? null : String.join(",", project.getAttachments()));
        entity.setCurrency(project.getCurrency());
        entity.setLanguage(project.getLanguage());
        entity.setMinBudget(project.getMinBudget());
        entity.setMaxBudget(project.getMaxBudget());
        entity.setHourlyRateMin(project.getHourlyRateMin());
        entity.setHourlyRateMax(project.getHourlyRateMax());
        entity.setStatus(project.getStatus());
        entity.setSelectedFreelancerUserId(project.getSelectedFreelancerUserId());

        List<ProposalJpaEntity> proposalEntities = project.getProposals().stream()
                .map(proposal -> toProposalEntity(proposal, entity))
                .toList();

        List<MilestoneJpaEntity> milestoneEntities = project.getMilestones().stream()
                .map(milestone -> toMilestoneEntity(milestone, entity))
                .toList();

        entity.setProposals(proposalEntities);
        entity.setMilestones(milestoneEntities);
        return entity;
    }

    public FreelanceProject toFreelanceProjectDomain(FreelanceProjectJpaEntity entity) {
        return FreelanceProject.restore(
                new FreelanceProjectId(entity.getId()),
                entity.getClientUserId(),
                entity.getTitle(),
                entity.getDescription(),
                entity.getCategory(),
                entity.getSubcategory(),
                entity.getBudget(),
                entity.getEstimatedDays(),
                entity.getExperienceLevel(),
                entity.getSkills() != null ? List.of(entity.getSkills().split(",")) : List.of(),
                entity.getBudgetType(),
                entity.getModality(),
                entity.getProviderType(),
                entity.getAttachments() != null ? List.of(entity.getAttachments().split(",")) : List.of(),
                entity.getStatus(),
                entity.getSelectedFreelancerUserId(),
                entity.getProposals().stream().map(this::toProposal).toList(),
                entity.getMilestones().stream().map(this::toMilestone).toList(),
                entity.getCreatedAt(),
                entity.getCurrency(),
                entity.getLanguage(),
                entity.getMinBudget(),
                entity.getMaxBudget(),
                entity.getHourlyRateMin(),
                entity.getHourlyRateMax()
        );
    }

    public FreelancerCertificationEmbeddable toEmbeddable(FreelancerCertification certification) {
        FreelancerCertificationEmbeddable embeddable = new FreelancerCertificationEmbeddable();
        embeddable.setName(certification.getName());
        embeddable.setIssuingOrganization(certification.getIssuingOrganization());
        embeddable.setCredentialUrl(certification.getCredentialUrl());
        return embeddable;
    }

    private FreelancerCertification toCertification(FreelancerCertificationEmbeddable embeddable) {
        return FreelancerCertification.create(
                embeddable.getName(),
                embeddable.getIssuingOrganization(),
                embeddable.getCredentialUrl()
        );
    }

    private ProposalJpaEntity toProposalEntity(Proposal proposal, FreelanceProjectJpaEntity project) {
        ProposalJpaEntity entity = new ProposalJpaEntity();
        entity.setId(proposal.getId().value());
        entity.setProject(project);
        entity.setFreelancerUserId(proposal.getFreelancerUserId());
        entity.setCoverLetter(proposal.getCoverLetter());
        entity.setProposedBudget(proposal.getProposedBudget());
        entity.setEstimatedDays(proposal.getEstimatedDays());
        entity.setPortfolioUrl(proposal.getPortfolioUrl());
        entity.setSubmittedAt(proposal.getSubmittedAt());
        entity.setStatus(proposal.getStatus());
        return entity;
    }

    public Proposal toProposal(ProposalJpaEntity entity) {

        return Proposal.restore(
                new ProposalId(entity.getId()),
                entity.getFreelancerUserId(),
                entity.getCoverLetter(),
                entity.getProposedBudget(),
                entity.getEstimatedDays(),
                entity.getPortfolioUrl(),
                entity.getSubmittedAt(),
                entity.getStatus()
        );
    }

    private MilestoneJpaEntity toMilestoneEntity(Milestone milestone, FreelanceProjectJpaEntity project) {
        MilestoneJpaEntity entity = new MilestoneJpaEntity();
        entity.setId(milestone.getId().value());
        entity.setProject(project);
        entity.setTitle(milestone.getTitle());
        entity.setDescription(milestone.getDescription());
        entity.setAmount(milestone.getAmount());
        entity.setStatus(milestone.getStatus());
        return entity;
    }

    private Milestone toMilestone(MilestoneJpaEntity entity) {
        return Milestone.restore(
                new MilestoneId(entity.getId()),
                entity.getTitle(),
                entity.getDescription(),
                entity.getAmount(),
                entity.getStatus()
        );
    }
}