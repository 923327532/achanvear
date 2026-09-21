package achanvear.peru.freelance.application.command;

public record PortfolioItemCommand(
        String title,
        String description,
        String assetUrl,
        String projectUrl
) {
}