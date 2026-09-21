package achanvear.peru.profile.application;

import achanvear.peru.profile.application.command.RateProfileCommand;
import achanvear.peru.profile.application.dto.TalentProfileResponse;

public interface RateProfileUseCase {

    TalentProfileResponse execute(RateProfileCommand command);
}