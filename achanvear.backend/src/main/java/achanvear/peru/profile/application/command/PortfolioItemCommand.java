package achanvear.peru.profile.application.command;

public record PortfolioItemCommand(
        String title,
        String description,
        String assetUrl,
        String projectUrl
) {
}