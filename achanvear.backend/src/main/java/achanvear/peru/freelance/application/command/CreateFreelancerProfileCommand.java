package achanvear.peru.freelance.application.command;

import java.util.List;

public record CreateFreelancerProfileCommand(
        String userId,
        String name,
        String industry,
        String specialty,
        String profilePhotoUrl,
        String biography,
        String achievements,
        String address,
        String paymentMethodType,
        String dni,
        String curriculumUrl,
        List<FreelancerCertificationCommand> certifications,
        List<SkillCommand> skills,
        List<PortfolioItemCommand> portfolioItems
) {
}
