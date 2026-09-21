package achanvear.peru.profile.application.command;

public record RateProfileCommand(
        String profileId,
        String reviewerUserId,
        String reviewerType,
        int stars,
        boolean recommended,
        String comment
) {
}