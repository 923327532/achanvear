package achanvear.peru.profile.application.impl;

import achanvear.peru.profile.*;
import achanvear.peru.profile.application.*;
import achanvear.peru.profile.application.command.*;
import achanvear.peru.profile.application.dto.TalentProfilePageResponse;
import achanvear.peru.profile.application.dto.TalentProfileResponse;
import achanvear.peru.profile.application.port.out.ProfileValidationPort;
import achanvear.peru.profile.application.query.ProfileSearchQuery;
import achanvear.peru.profile.domain.factory.TalentProfileFactory;
import achanvear.peru.profile.domain.model.*;
import achanvear.peru.shared.application.EventPublisher;
import achanvear.peru.shared.domain.exception.ResourceNotFoundException;
import achanvear.peru.shared.exception.BusinessRuleViolationException;
import achanvear.peru.shared.exception.ForbiddenOperationException;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class ProfileApplicationService implements
        CreateTalentProfileUseCase,
        UpdateTalentProfileUseCase,
        RateProfileUseCase,
        GetMyTalentProfileUseCase,
        GetTalentProfileDetailUseCase,
        SearchTalentProfilesUseCase {

    private final TalentProfileRepository talentProfileRepository;
    private final TalentProfileFactory talentProfileFactory;
    private final ProfileApplicationMapper profileApplicationMapper;
    private final ProfileValidationPort profileValidationPort;
    private final EventPublisher eventPublisher;

    public ProfileApplicationService(
            TalentProfileRepository talentProfileRepository,
            TalentProfileFactory talentProfileFactory,
            ProfileApplicationMapper profileApplicationMapper,
            ProfileValidationPort profileValidationPort,
            EventPublisher eventPublisher
    ) {
        this.talentProfileRepository = talentProfileRepository;
        this.talentProfileFactory = talentProfileFactory;
        this.profileApplicationMapper = profileApplicationMapper;
        this.profileValidationPort = profileValidationPort;
        this.eventPublisher = eventPublisher;
    }

    @Override
    public TalentProfileResponse execute(CreateTalentProfileCommand command) {
        UUID userId = UUID.fromString(command.userId());

        if (talentProfileRepository.findByUserId(userId).isPresent()) {
            throw new BusinessRuleViolationException("User already has a talent profile");
        }

        TalentProfile profile = talentProfileFactory.create(
                userId,
                ProfileType.valueOf(command.profileType().trim().toUpperCase()),
                command.headline(),
                command.biography(),
                command.location(),
                command.profilePhotoUrl(),
                command.curriculumUrl(),
                mapSkills(command.skills()),
                mapPortfolioItems(command.portfolioItems())
        );

        talentProfileRepository.save(profile);
        profile.pullDomainEvents().forEach(eventPublisher::publish);

        return profileApplicationMapper.toResponse(profile);
    }

    @Override
    public TalentProfileResponse execute(UpdateTalentProfileCommand command) {
        TalentProfile profile = talentProfileRepository.findById(TalentProfileId.from(command.profileId()))
                .orElseThrow(() -> new ResourceNotFoundException("Talent profile not found"));

        UUID requesterUserId = UUID.fromString(command.requesterUserId());

        if (!profile.belongsTo(requesterUserId)) {
            throw new ForbiddenOperationException("You do not have permission to update this profile");
        }

        profile.updateProfile(
                ProfileType.valueOf(command.profileType().trim().toUpperCase()),
                command.headline(),
                command.biography(),
                command.location(),
                command.profilePhotoUrl(),
                command.curriculumUrl(),
                mapSkills(command.skills()),
                mapPortfolioItems(command.portfolioItems())
        );

        talentProfileRepository.save(profile);
        profile.pullDomainEvents().forEach(eventPublisher::publish);

        return profileApplicationMapper.toResponse(profile);
    }

    @Override
    public TalentProfileResponse execute(RateProfileCommand command) {
        TalentProfile profile = talentProfileRepository.findById(TalentProfileId.from(command.profileId()))
                .orElseThrow(() -> new ResourceNotFoundException("Talent profile not found"));

        profile.addRating(
                UUID.fromString(command.reviewerUserId()),
                RatingTargetType.valueOf(command.reviewerType().trim().toUpperCase()),
                command.stars(),
                command.recommended(),
                command.comment()
        );

        talentProfileRepository.save(profile);

        return profileApplicationMapper.toResponse(profile);
    }

    @Override
    @Transactional
    public TalentProfileResponse getMyProfile(String requesterUserId) {
        UUID userId = UUID.fromString(requesterUserId);
        return talentProfileRepository.findByUserId(userId)
                .map(profileApplicationMapper::toResponse)
                .orElseGet(() -> {
                    // Auto-create a basic TalentProfile if none exists
                    TalentProfile profile = TalentProfile.create(
                            userId,
                            ProfileType.FREELANCER,
                            "Profesional",
                            "Perfil en construcción. Completa tu información profesional para que las empresas puedan conocerte mejor.",
                            "Por definir",
                            null,
                            null,
                            java.util.Collections.emptyList(),
                            java.util.Collections.emptyList()
                    );
                    talentProfileRepository.save(profile);
                    return profileApplicationMapper.toResponse(profile);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public TalentProfileResponse getById(String profileId) {
        TalentProfile profile = talentProfileRepository.findById(TalentProfileId.from(profileId))
                .orElseThrow(() -> new ResourceNotFoundException("Talent profile not found"));

        return profileApplicationMapper.toResponse(profile);
    }

    @Override
    @Transactional(readOnly = true)
    public TalentProfilePageResponse execute(ProfileSearchQuery query) {
        Page<TalentProfile> page = talentProfileRepository.search(query);
        return profileApplicationMapper.toPageResponse(page);
    }

    private List<Skill> mapSkills(List<SkillCommand> skills) {
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

    private List<PortfolioItem> mapPortfolioItems(List<PortfolioItemCommand> items) {
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
}
