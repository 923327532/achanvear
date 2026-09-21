package achanvear.peru.profile.application.dto;

import java.util.List;

public record TalentProfileResponse(
        String id,
        String userId,
        String profileType,
        String headline,
        String biography,
        String location,
        String profilePhotoUrl,
        String curriculumUrl,
        String status,
        ReputationScoreResponse reputationScore,
        List<SkillResponse> skills,
        List<PortfolioItemResponse> portfolioItems,
        List<ProfileRatingResponse> ratings
) {
}