package achanvear.peru.company.application.dto;

import achanvear.peru.company.domain.model.Company;
import achanvear.peru.profile.TalentProfile;
import achanvear.peru.profile.domain.model.ReputationScore;
import achanvear.peru.profile.domain.model.ProfileRating;
import java.util.List;
import java.math.BigDecimal;

public record CompanyResponse(
        String id,
        String ownerUserId,
        String businessName,
        String tradeName,
        String legalName,
        String industry,
        String specialty,
        String companySize,
        String logoUrl,
        String bannerUrl,
        String biography,
        String achievements,
        String address,
        String paymentMethodType,
        String companyPlan,
        String representativeDni,
        String ruc,
        String status,
        String name,
        BigDecimal averageRating,
        int totalRatings,
        ReputationScore reputationScore,
        List<ProfileRating> ratings) {

    public static CompanyResponse from(Company company) {
        return from(company, null);
    }

    public static CompanyResponse from(Company company, TalentProfile profile) {
        var ratings = profile == null ? List.<ProfileRating>of() : profile.getRatings();
        var score = ReputationScore.fromRatings(ratings);
        return new CompanyResponse(
                company.getId().toString(),
                company.getOwnerUserId().toString(),
                company.getBusinessName(),
                company.getTradeName(),
                company.getLegalName(),
                company.getIndustry(),
                company.getSpecialty(),
                company.getCompanySize().name(),
                company.getLogoUrl(),
                company.getBannerUrl(),
                company.getBiography(),
                company.getAchievements(),
                company.getAddress(),
                company.getPaymentMethodType().name(),
                company.getCompanyPlan().name(),
                company.getRepresentativeDni().value(),
                company.getRuc() != null ? company.getRuc().value() : null,
                company.getStatus().name(),
                company.getBusinessName(),
                score.averageStars(), score.totalRatings(), score, ratings);
    }
}
