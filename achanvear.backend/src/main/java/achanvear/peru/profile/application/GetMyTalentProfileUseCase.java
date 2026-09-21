package achanvear.peru.profile.application;

import achanvear.peru.profile.application.dto.TalentProfileResponse;

public interface GetMyTalentProfileUseCase {

    TalentProfileResponse getMyProfile(String requesterUserId);
}