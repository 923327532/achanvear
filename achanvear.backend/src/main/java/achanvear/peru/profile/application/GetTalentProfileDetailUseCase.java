package achanvear.peru.profile.application;

import achanvear.peru.profile.application.dto.TalentProfileResponse;

public interface GetTalentProfileDetailUseCase {

    TalentProfileResponse getById(String profileId);
}