package achanvear.peru.profile.application.command;

import java.util.List;

public record CreateTalentProfileCommand(
        String userId,
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