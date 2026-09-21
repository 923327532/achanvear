package achanvear.peru.profile.application.command;

import java.util.List;

public record UpdateTalentProfileCommand(
        String profileId,
        String requesterUserId,
        String profileType,
        String headline,
        String biography,
        String location,
        String profilePhotoUrl,
        String curriculumUrl,
        List<SkillCommand> skills,
        List<PortfolioItemCommand> portfolioItems
) {
}