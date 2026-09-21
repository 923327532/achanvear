package achanvear.peru.profile.application;

import achanvear.peru.profile.application.dto.TalentProfilePageResponse;
import achanvear.peru.profile.application.query.ProfileSearchQuery;

public interface SearchTalentProfilesUseCase {

    TalentProfilePageResponse execute(ProfileSearchQuery query);
}