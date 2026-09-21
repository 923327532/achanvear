package achanvear.peru.profile.application.impl;

import achanvear.peru.profile.TalentProfile;
import achanvear.peru.profile.application.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

@Component
public class ProfileApplicationMapper {

    public TalentProfileResponse toResponse(TalentProfile profile) {
        return new TalentProfileResponse(
                profile.getId().toString(),
                profile.getUserId().toString(),
                profile.getProfileType().name(),
                profile.getHeadline(),
                profile.getBiography(),
                profile.getLocation(),
                profile.getProfilePhotoUrl(),
                profile.getCurriculumUrl(),
                profile.getStatus().name(),
                new ReputationScoreResponse(
                        profile.getReputationScore().averageStars(),
                        profile.getReputationScore().recommendationPercentage(),
                        profile.getReputationScore().totalRatings()
                ),
                profile.getSkills().stream()
                        .map(skill -> new SkillResponse(
                                skill.getName(),
                                skill.getLevel().name(),
                                skill.getYearsOfExperience()
                        ))
                        .toList(),
                profile.getPortfolioItems().stream()
                        .map(item -> new PortfolioItemResponse(
                                item.getTitle(),
                                item.getDescription(),
                                item.getAssetUrl(),
                                item.getProjectUrl()
                        ))
                        .toList(),
                profile.getRatings().stream()
                        .map(rating -> new ProfileRatingResponse(
                                rating.getReviewerUserId().toString(),
                                rating.getReviewerType().name(),
                                rating.getStars(),
                                rating.isRecommended(),
                                rating.getComment(),
                                rating.getCreatedAt()
                        ))
                        .toList()
        );
    }

    public TalentProfilePageResponse toPageResponse(Page<TalentProfile> page) {
        return new TalentProfilePageResponse(
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
