package achanvear.peru.profile.domain.factory;

import achanvear.peru.profile.PortfolioItem;
import achanvear.peru.profile.ProfileType;
import achanvear.peru.profile.Skill;
import achanvear.peru.profile.TalentProfile;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
public class TalentProfileFactory {

    public TalentProfile create(
            UUID userId,
            ProfileType profileType,
            String headline,
            String biography,
            String location,
            String profilePhotoUrl,
            String curriculumUrl,
            List<Skill> skills,
            List<PortfolioItem> portfolioItems
    ) {
        return TalentProfile.create(
                userId,
                profileType,
                headline,
                biography,
                location,
                profilePhotoUrl,
                curriculumUrl,
                skills,
                portfolioItems
        );
    }
}