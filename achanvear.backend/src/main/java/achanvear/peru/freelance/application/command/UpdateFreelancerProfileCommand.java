package achanvear.peru.freelance.application.command;

import java.util.List;

public record UpdateFreelancerProfileCommand(
        String freelancerId,
        String requesterUserId,
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
        String cvData,
        List<FreelancerCertificationCommand> certifications,
        List<SkillCommand> skills,
        List<PortfolioItemCommand> portfolioItems,
        String availabilityStatus,
        String cvVisibility,
        String preferredCurrency,
        String preferredPaymentMethod,
        String language,
        String timezone,
        String notificationPreferences
) {
}