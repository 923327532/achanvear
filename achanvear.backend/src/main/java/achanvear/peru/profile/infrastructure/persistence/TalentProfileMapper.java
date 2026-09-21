package achanvear.peru.profile.infrastructure.persistence;

import achanvear.peru.profile.PortfolioItem;
import achanvear.peru.profile.Skill;
import achanvear.peru.profile.TalentProfile;
import achanvear.peru.profile.domain.model.*;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Component
public class TalentProfileMapper {

    public TalentProfileJpaEntity toEntity(TalentProfile profile) {
        TalentProfileJpaEntity entity = new TalentProfileJpaEntity();
        entity.setId(profile.getId().value());
        entity.setUserId(profile.getUserId());
        entity.setProfileType(profile.getProfileType());
        entity.setHeadline(profile.getHeadline());
        entity.setBiography(profile.getBiography());
        entity.setLocation(profile.getLocation());
        entity.setProfilePhotoUrl(profile.getProfilePhotoUrl());
        entity.setCurriculumUrl(profile.getCurriculumUrl());
        entity.setStatus(profile.getStatus());

        List<SkillJpaEntity> skillEntities = new ArrayList<>();
        for (Skill skill : profile.getSkills()) {
            SkillJpaEntity skillEntity = new SkillJpaEntity();
            skillEntity.setId(UUID.randomUUID());
            skillEntity.setProfile(entity);
            skillEntity.setName(skill.getName());
            skillEntity.setLevel(skill.getLevel());
            skillEntity.setYearsOfExperience(skill.getYearsOfExperience());
            skillEntities.add(skillEntity);
        }
        entity.setSkills(skillEntities);

        List<PortfolioItemJpaEntity> portfolioEntities = new ArrayList<>();
        for (PortfolioItem item : profile.getPortfolioItems()) {
            PortfolioItemJpaEntity portfolioEntity = new PortfolioItemJpaEntity();
            portfolioEntity.setId(UUID.randomUUID());
            portfolioEntity.setProfile(entity);
            portfolioEntity.setTitle(item.getTitle());
            portfolioEntity.setDescription(item.getDescription());
            portfolioEntity.setAssetUrl(item.getAssetUrl());
            portfolioEntity.setProjectUrl(item.getProjectUrl());
            portfolioEntities.add(portfolioEntity);
        }
        entity.setPortfolioItems(portfolioEntities);

        List<ProfileRatingJpaEntity> ratingEntities = new ArrayList<>();
        for (ProfileRating rating : profile.getRatings()) {
            ProfileRatingJpaEntity ratingEntity = new ProfileRatingJpaEntity();
            ratingEntity.setId(UUID.randomUUID());
            ratingEntity.setProfile(entity);
            ratingEntity.setReviewerUserId(rating.getReviewerUserId());
            ratingEntity.setReviewerType(rating.getReviewerType());
            ratingEntity.setStars(rating.getStars());
            ratingEntity.setRecommended(rating.isRecommended());
            ratingEntity.setComment(rating.getComment());
            ratingEntity.setCreatedAt(rating.getCreatedAt());
            ratingEntities.add(ratingEntity);
        }
        entity.setRatings(ratingEntities);

        return entity;
    }

    public TalentProfile toDomain(TalentProfileJpaEntity entity) {
        return TalentProfile.restore(
                new TalentProfileId(entity.getId()),
                entity.getUserId(),
                entity.getProfileType(),
                entity.getHeadline(),
                entity.getBiography(),
                entity.getLocation(),
                entity.getProfilePhotoUrl(),
                entity.getCurriculumUrl(),
                entity.getStatus(),
                entity.getSkills().stream()
                        .map(skill -> Skill.create(
                                skill.getName(),
                                skill.getLevel(),
                                skill.getYearsOfExperience()
                        ))
                        .toList(),
                entity.getPortfolioItems().stream()
                        .map(item -> PortfolioItem.create(
                                item.getTitle(),
                                item.getDescription(),
                                item.getAssetUrl(),
                                item.getProjectUrl()
                        ))
                        .toList(),
                entity.getRatings().stream()
                        .map(rating -> ProfileRating.restore(
                                rating.getReviewerUserId(),
                                rating.getReviewerType(),
                                rating.getStars(),
                                rating.isRecommended(),
                                rating.getComment(),
                                rating.getCreatedAt()
                        ))
                        .toList()
        );
    }
}