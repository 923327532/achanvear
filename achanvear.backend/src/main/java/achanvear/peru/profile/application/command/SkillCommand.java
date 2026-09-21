package achanvear.peru.profile.application.command;

public record SkillCommand(
        String name,
        String level,
        Integer yearsOfExperience
) {
}