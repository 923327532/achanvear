package achanvear.peru.freelance.application.impl;

import achanvear.peru.freelance.application.*;
import achanvear.peru.freelance.application.command.*;
import achanvear.peru.freelance.application.dto.FreelanceProjectPageResponse;
import achanvear.peru.freelance.application.dto.FreelanceProjectResponse;
import achanvear.peru.freelance.application.dto.FreelancerProfileResponse;
import achanvear.peru.freelance.application.port.out.DniValidationPort;
import achanvear.peru.freelance.application.query.FreelanceProjectSearchQuery;
import achanvear.peru.freelance.domain.factory.FreelanceProjectFactory;
import achanvear.peru.freelance.domain.factory.FreelancerProfileFactory;
import achanvear.peru.freelance.domain.model.*;
import achanvear.peru.freelance.domain.model.PaymentMethodType;
import achanvear.peru.freelance.domain.repository.FreelanceProjectRepository;
import achanvear.peru.freelance.domain.repository.FreelancerProfileRepository;
import achanvear.peru.profile.*;
import achanvear.peru.shared.application.port.IdentityFreelancerLookupPort;
import achanvear.peru.shared.domain.exception.ResourceNotFoundException;
import achanvear.peru.shared.exception.BusinessRuleViolationException;
import achanvear.peru.shared.exception.ForbiddenOperationException;
import achanvear.peru.shared.application.EventPublisher;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class FreelanceApplicationService implements
        CreateFreelancerProfileUseCase,
        UpdateFreelancerProfileUseCase,
        CreateFreelanceProjectUseCase,
        UpdateFreelanceProjectUseCase,
        SubmitProposalUseCase,
        AcceptProposalUseCase,
        SearchFreelanceProjectsUseCase,
        GetMyFreelancerProfileUseCase,
        GetFreelancerProfileByIdUseCase,
        GetFreelanceProjectDetailUseCase,
        GetMyProposalsUseCase,
        PauseResumeProjectUseCase {

    private final FreelancerProfileRepository freelancerProfileRepository;
    private final FreelanceProjectRepository freelanceProjectRepository;
    private final FreelancerProfileFactory freelancerProfileFactory;
    private final FreelanceProjectFactory freelanceProjectFactory;
    private final DniValidationPort dniValidationPort;
    private final IdentityFreelancerLookupPort identityFreelancerLookupPort;
    private final TalentProfileRepository talentProfileRepository;
    private final EventPublisher eventPublisher;
    private final FreelanceApplicationMapper freelanceApplicationMapper;

    public FreelanceApplicationService(
            FreelancerProfileRepository freelancerProfileRepository,
            FreelanceProjectRepository freelanceProjectRepository,
            FreelancerProfileFactory freelancerProfileFactory,
            FreelanceProjectFactory freelanceProjectFactory,
            DniValidationPort dniValidationPort,
            IdentityFreelancerLookupPort identityFreelancerLookupPort,
            TalentProfileRepository talentProfileRepository,
            EventPublisher eventPublisher,
            FreelanceApplicationMapper freelanceApplicationMapper
    ) {
        this.freelancerProfileRepository = freelancerProfileRepository;
        this.freelanceProjectRepository = freelanceProjectRepository;
        this.freelancerProfileFactory = freelancerProfileFactory;
        this.freelanceProjectFactory = freelanceProjectFactory;
        this.dniValidationPort = dniValidationPort;
        this.identityFreelancerLookupPort = identityFreelancerLookupPort;
        this.talentProfileRepository = talentProfileRepository;
        this.eventPublisher = eventPublisher;
        this.freelanceApplicationMapper = freelanceApplicationMapper;
    }


    @Override
    public FreelancerProfileResponse execute(CreateFreelancerProfileCommand command) {
        UUID userId = UUID.fromString(command.userId());

        IdentityFreelancerLookupPort.FreelancerUserSummary user = identityFreelancerLookupPort.findById(userId);
        validateFreelancerUser(user, userId);

        if (freelancerProfileRepository.findByUserId(userId).isPresent()) {
            throw new BusinessRuleViolationException("User already has a freelancer profile");
        }

        if (freelancerProfileRepository.existsByDni(command.dni())) {
            throw new BusinessRuleViolationException("Dni is already associated with another freelancer profile");
        }

        // External DNI validation is best-effort; database uniqueness check is the critical validation
        try {
            DniValidationPort.DniValidationResult validation = dniValidationPort.validate(command.dni());
            if (!validation.valid()) {
                // Log the error, but do not throw an exception
                // logger.error("DNI validation failed: {}", validation.getErrorMessage());
            }
        } catch (Exception e) {
            // Log the error, but do not throw an exception
            // logger.error("Error validating DNI: {}", e.getMessage());
        }

        PaymentMethodType paymentMethod = parsePaymentMethodType(command.paymentMethodType());

        FreelancerProfile profile = freelancerProfileFactory.create(
                userId,
                command.name(),
                command.industry(),
                command.specialty(),
                command.profilePhotoUrl(),
                command.biography(),
                command.achievements(),
                command.address(),
                paymentMethod,
                command.dni(),
                command.curriculumUrl(),
                mapCertifications(command.certifications())
        );

        profile.validateIdentity();

        freelancerProfileRepository.save(profile);
        profile.pullDomainEvents().forEach(eventPublisher::publish);

        // ── Crear también el TalentProfile (skills + portfolioItems) ──
        TalentProfile talentProfile = TalentProfile.create(
                userId,
                ProfileType.FREELANCER,
                command.name() != null ? command.name() : "Profesional",
                command.biography() != null ? command.biography() : "",
                command.address() != null ? command.address() : "",
                command.profilePhotoUrl(),
                command.curriculumUrl(),
                mapSkillsFromCommand(command.skills()),
                mapPortfolioItemsFromCommand(command.portfolioItems())
        );
        talentProfileRepository.save(talentProfile);

        return freelanceApplicationMapper.toFreelancerProfileResponse(profile, talentProfile);
    }

    @Override
    public FreelancerProfileResponse execute(UpdateFreelancerProfileCommand command) {
        FreelancerProfile profile = freelancerProfileRepository.findById(command.freelancerId())
                .orElseThrow(() -> new ResourceNotFoundException("Freelancer profile not found"));

        if (!profile.getUserId().equals(UUID.fromString(command.requesterUserId()))) {
            throw new ForbiddenOperationException("You do not have permission to update this freelancer profile");
        }

        // External DNI validation is best-effort; database uniqueness check is the critical validation
        try {
            DniValidationPort.DniValidationResult validation = dniValidationPort.validate(command.dni());
            if (!validation.valid()) {
                // Log the error, but do not throw an exception
                // logger.error("DNI validation failed: {}", validation.getErrorMessage());
            }
        } catch (Exception e) {
            // Log the error, but do not throw an exception
            // logger.error("Error validating DNI: {}", e.getMessage());
        }

        PaymentMethodType paymentMethod = parsePaymentMethodType(command.paymentMethodType());

        AvailabilityStatus availabilityStatus = parseAvailabilityStatus(command.availabilityStatus());
        CvVisibility cvVisibility = parseCvVisibility(command.cvVisibility());
        PreferredCurrency preferredCurrency = parsePreferredCurrency(command.preferredCurrency());
        PreferredPaymentMethod preferredPaymentMethod = parsePreferredPaymentMethod(command.preferredPaymentMethod());

        profile.updateProfile(
                command.name(),
                command.industry(),
                command.specialty(),
                command.profilePhotoUrl(),
                command.biography(),
                command.achievements(),
                command.address(),
                paymentMethod,
                command.dni(),
                command.curriculumUrl(),
                command.cvData(),
                mapCertifications(command.certifications()),
                availabilityStatus,
                cvVisibility,
                preferredCurrency,
                preferredPaymentMethod,
                command.language(),
                command.timezone(),
                command.notificationPreferences()
        );


        freelancerProfileRepository.save(profile);

        // ── Actualizar también el TalentProfile (skills + portfolioItems) ──
        UUID userId = UUID.fromString(command.requesterUserId());
        TalentProfile talentProfile = talentProfileRepository.findByUserId(userId).orElseGet(() -> {
            return TalentProfile.create(
                    userId,
                    ProfileType.FREELANCER,
                    command.name() != null ? command.name() : "Profesional",
                    command.biography() != null ? command.biography() : "",
                    command.address() != null ? command.address() : "",
                    command.profilePhotoUrl(),
                    command.curriculumUrl(),
                    mapSkillsFromCommand(command.skills()),
                    mapPortfolioItemsFromCommand(command.portfolioItems())
            );
        });

        talentProfile.updateProfile(
                talentProfile.getProfileType(),
                talentProfile.getHeadline(),
                talentProfile.getBiography(),
                talentProfile.getLocation(),
                talentProfile.getProfilePhotoUrl(),
                talentProfile.getCurriculumUrl(),
                mapSkillsFromCommand(command.skills()),
                mapPortfolioItemsFromCommand(command.portfolioItems())
        );
        talentProfileRepository.save(talentProfile);

        return freelanceApplicationMapper.toFreelancerProfileResponse(profile, talentProfile);
    }

    @Override
    public FreelanceProjectResponse execute(CreateFreelanceProjectCommand command) {
        FreelanceProject project = freelanceProjectFactory.create(
                UUID.fromString(command.clientUserId()),
                command.title(),
                command.description(),
                command.category(),
                command.subcategory(),
                command.budget(),
                command.estimatedDays(),
                command.experienceLevel(),
                command.skills(),
                command.budgetType(),
                command.modality(),
                command.providerType(),
                command.attachments(),
                command.currency(),
                command.language(),
                command.minBudget(),
                command.maxBudget(),
                command.hourlyRateMin(),
                command.hourlyRateMax()
        );

        freelanceProjectRepository.save(project);
        project.pullDomainEvents().forEach(eventPublisher::publish);

        return freelanceApplicationMapper.toProjectResponse(project);
    }

    @Override
    public FreelanceProjectResponse execute(UpdateFreelanceProjectCommand command) {
        FreelanceProject project = freelanceProjectRepository.findById(FreelanceProjectId.from(command.projectId()))
                .orElseThrow(() -> new ResourceNotFoundException("Freelance project not found"));

        UUID requesterUserId = UUID.fromString(command.requesterUserId());
        if (!project.belongsToClient(requesterUserId)) {
            throw new ForbiddenOperationException("You do not have permission to update this project");
        }

        project.update(
                command.title(),
                command.description(),
                command.category(),
                command.subcategory(),
                command.budget(),
                command.estimatedDays(),
                command.experienceLevel(),
                command.skills(),
                command.budgetType(),
                command.modality(),
                command.providerType(),
                command.attachments(),
                command.currency(),
                command.language(),
                command.minBudget(),
                command.maxBudget(),
                command.hourlyRateMin(),
                command.hourlyRateMax()
        );

        freelanceProjectRepository.save(project);

        return freelanceApplicationMapper.toProjectResponse(project);
    }

    @Override
    public FreelanceProjectResponse execute(SubmitProposalCommand command) {
        FreelanceProject project = freelanceProjectRepository.findById(FreelanceProjectId.from(command.projectId()))
                .orElseThrow(() -> new ResourceNotFoundException("Freelance project not found"));

        UUID freelancerUserId = UUID.fromString(command.freelancerUserId());

        if (project.getClientUserId().equals(freelancerUserId)) {
            throw new BusinessRuleViolationException("Project owner cannot submit a proposal to the same project");
        }

        project.submitProposal(
                freelancerUserId,
                command.coverLetter(),
                command.proposedBudget(),
                command.estimatedDays(),
                command.portfolioUrl()
        );

        freelanceProjectRepository.save(project);
        project.pullDomainEvents().forEach(eventPublisher::publish);

        return freelanceApplicationMapper.toProjectResponse(project, freelancerUserId);
    }

    @Override
    public FreelanceProjectResponse execute(AcceptProposalCommand command) {

        FreelanceProject project = freelanceProjectRepository.findById(FreelanceProjectId.from(command.projectId()))
                .orElseThrow(() -> new ResourceNotFoundException("Freelance project not found"));

        UUID requesterClientUserId = UUID.fromString(command.requesterClientUserId());

        if (!project.belongsToClient(requesterClientUserId)) {
            throw new ForbiddenOperationException("You do not have permission to manage this freelance project");
        }

        project.acceptProposal(new ProposalId(UUID.fromString(command.proposalId())));

        freelanceProjectRepository.save(project);

        return freelanceApplicationMapper.toProjectResponse(project);
    }

    @Override
    @Transactional(readOnly = true)
    public FreelanceProjectPageResponse execute(FreelanceProjectSearchQuery query) {
        return execute(query, null);
    }

    @Override
    @Transactional(readOnly = true)
    public FreelanceProjectPageResponse execute(FreelanceProjectSearchQuery query, UUID authenticatedUserId) {
        Page<FreelanceProject> page = freelanceProjectRepository.search(query);
        return freelanceApplicationMapper.toProjectPageResponse(page, authenticatedUserId);
    }

    @Override
    @Transactional(readOnly = true)
    public FreelancerProfileResponse getMyProfile(String requesterUserId) {
        UUID userId = UUID.fromString(requesterUserId);

        // Buscar TalentProfile para combinar datos
        TalentProfile talentProfile = talentProfileRepository.findByUserId(userId).orElse(null);

        return freelancerProfileRepository.findByUserId(userId)
                .map(profile -> freelanceApplicationMapper.toFreelancerProfileResponse(profile, talentProfile))
                .orElseGet(() -> {
                    // Si no hay perfil en freelancer_profiles, construir uno virtual con datos del usuario
                    IdentityFreelancerLookupPort.FreelancerUserSummary user = identityFreelancerLookupPort.findById(userId);

                    // Datos del TalentProfile
                    String headline = talentProfile != null ? talentProfile.getHeadline() : null;
                    String location = talentProfile != null ? talentProfile.getLocation() : null;
                    FreelancerProfileResponse.ReputationScoreResponse reputationScore = null;
                    List<FreelancerProfileResponse.SkillResponse> skills = null;
                    List<FreelancerProfileResponse.PortfolioItemResponse> portfolioItems = null;
                    List<FreelancerProfileResponse.ProfileRatingResponse> ratings = null;

                    if (talentProfile != null && talentProfile.getReputationScore() != null) {
                        reputationScore = new FreelancerProfileResponse.ReputationScoreResponse(
                                talentProfile.getReputationScore().averageStars(),
                                talentProfile.getReputationScore().recommendationPercentage(),
                                talentProfile.getReputationScore().totalRatings()
                        );
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
                            null,                    // id - no existe en freelancer_profiles
                            userId.toString(),       // userId
                            user.fullName(),         // name - del registro de usuario
                            null,                    // industry
                            null,                    // specialty
                            null,                    // profilePhotoUrl
                            null,                    // biography
                            null,                    // achievements
                            null,                    // address
                            null,                    // paymentMethodType
                            user.dni(),              // dni - del registro de usuario
                            null,                    // curriculumUrl
                            null,                    // cvData
                            "ACTIVE",                // status
                            java.util.List.of(),     // certifications
                            headline,
                            location,
                            reputationScore,
                            skills,
                            portfolioItems,
                            ratings,
                            null,                    // availabilityStatus
                            null,                    // cvVisibility
                            null,                    // preferredCurrency
                            null,                    // preferredPaymentMethod
                            null,                    // language
                            null,                    // timezone
                            null                     // notificationPreferences
                    );

                });
    }

    @Override
    @Transactional(readOnly = true)
    public FreelancerProfileResponse getFreelancerProfileById(String freelancerId) {
        FreelancerProfile profile = freelancerProfileRepository.findById(String.valueOf(UUID.fromString(freelancerId)))
                .orElseThrow(() -> new ResourceNotFoundException("Freelancer profile not found"));

        // Buscar TalentProfile para combinar datos
        TalentProfile talentProfile = talentProfileRepository.findByUserId(profile.getUserId()).orElse(null);

        return freelanceApplicationMapper.toFreelancerProfileResponse(profile, talentProfile);
    }


    @Transactional(readOnly = true)
    @Override
    public FreelanceProjectResponse getFreelanceProjectDetail(String projectId) {
        return getById(projectId, null);
    }

    @Override
    public FreelanceProjectResponse getById(String projectId) {
        return getById(projectId, null);
    }

    @Override
    public FreelanceProjectResponse getById(String projectId, UUID authenticatedUserId) {
        FreelanceProject project = freelanceProjectRepository.findById(FreelanceProjectId.from(projectId))
                .orElseThrow(() -> new ResourceNotFoundException("Freelance project not found"));

        return freelanceApplicationMapper.toProjectResponse(project, authenticatedUserId);
    }

    @Override
    public void pauseProject(String projectId, String requesterUserId) {
        FreelanceProject project = freelanceProjectRepository.findById(FreelanceProjectId.from(projectId))
                .orElseThrow(() -> new ResourceNotFoundException("Freelance project not found"));

        UUID requester = UUID.fromString(requesterUserId);
        if (!project.belongsToClient(requester)) {
            throw new ForbiddenOperationException("You do not have permission to pause this project");
        }

        project.pause();
        freelanceProjectRepository.save(project);
    }

    @Override
    public void resumeProject(String projectId, String requesterUserId) {
        FreelanceProject project = freelanceProjectRepository.findById(FreelanceProjectId.from(projectId))
                .orElseThrow(() -> new ResourceNotFoundException("Freelance project not found"));

        UUID requester = UUID.fromString(requesterUserId);
        if (!project.belongsToClient(requester)) {
            throw new ForbiddenOperationException("You do not have permission to resume this project");
        }

        project.resume();
        freelanceProjectRepository.save(project);
    }

    @Override
    @Transactional
    public void deleteProject(String projectId, String requesterUserId) {
        FreelanceProject project = freelanceProjectRepository.findById(FreelanceProjectId.from(projectId))
                .orElseThrow(() -> new ResourceNotFoundException("Freelance project not found"));

        UUID requester = UUID.fromString(requesterUserId);
        if (!project.belongsToClient(requester)) {
            throw new ForbiddenOperationException("You do not have permission to delete this project");
        }

        // Soft-delete: set status to CANCELLED
        project.cancel();
        freelanceProjectRepository.save(project);
    }

    @Override
    @Transactional(readOnly = true)
    public FreelanceProjectPageResponse execute(String freelancerUserId, int page, int size, String sortBy, String sortDirection) {
        Pageable pageable = PageRequest.of(
                Math.max(page, 0),
                Math.min(Math.max(size, 1), 100),
                Sort.by(resolveDirection(sortDirection), resolveSortBy(sortBy))
        );

        Page<FreelanceProject> projects = freelanceProjectRepository.findProjectsByFreelancerProposals(
                UUID.fromString(freelancerUserId),
                pageable
        );

        return freelanceApplicationMapper.toProjectPageResponse(projects);
    }

    private Sort.Direction resolveDirection(String value) {
        if (value == null || value.isBlank()) {
            return Sort.Direction.DESC;
        }
        return "ASC".equalsIgnoreCase(value) ? Sort.Direction.ASC : Sort.Direction.DESC;
    }

    private String resolveSortBy(String value) {
        if (value == null || value.isBlank()) {
            return "createdAt";
        }
        return switch (value) {
            case "title", "budget", "estimatedDays", "createdAt" -> value;
            default -> "createdAt";
        };
    }

    private void validateFreelancerUser(
            IdentityFreelancerLookupPort.FreelancerUserSummary user,
            UUID userId
    ) {
        if (user == null) {
            throw new ResourceNotFoundException("Freelancer user not found");
        }

        if (!user.id().equals(userId)) {
            throw new BusinessRuleViolationException("Freelancer user data mismatch");
        }

        if (!"ACTIVE".equalsIgnoreCase(user.status())) {
            throw new BusinessRuleViolationException("Freelancer user must be active");
        }
    }

    private List<FreelancerCertification> mapCertifications(List<FreelancerCertificationCommand> certifications) {
        if (certifications == null) {
            return List.of();
        }

        return certifications.stream()
                .map(certification -> FreelancerCertification.create(
                        certification.name(),
                        certification.issuingOrganization(),
                        certification.credentialUrl()
                ))
                .toList();
    }

    private List<Skill> mapSkillsFromCommand(List<SkillCommand> skills) {
        if (skills == null) {
            return List.of();
        }
        return skills.stream()
                .map(skill -> Skill.create(
                        skill.name(),
                        SkillLevel.valueOf(skill.level().trim().toUpperCase()),
                        skill.yearsOfExperience()
                ))
                .toList();
    }

    private List<PortfolioItem> mapPortfolioItemsFromCommand(List<PortfolioItemCommand> items) {
        if (items == null) {
            return List.of();
        }
        return items.stream()
                .map(item -> PortfolioItem.create(
                        item.title(),
                        item.description(),
                        item.assetUrl(),
                        item.projectUrl()
                ))
                .toList();
    }

    /**
     * Safely parses a PaymentMethodType from a string value.
     * Returns BANK_TRANSFER as default when the value is null, blank, or invalid.
     */
    private PaymentMethodType parsePaymentMethodType(String value) {
        if (value == null || value.isBlank()) {
            return PaymentMethodType.BANK_TRANSFER;
        }
        try {
            return PaymentMethodType.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return PaymentMethodType.BANK_TRANSFER;
        }
    }

    private AvailabilityStatus parseAvailabilityStatus(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return AvailabilityStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private CvVisibility parseCvVisibility(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return CvVisibility.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private PreferredCurrency parsePreferredCurrency(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return PreferredCurrency.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private PreferredPaymentMethod parsePreferredPaymentMethod(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return PreferredPaymentMethod.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
