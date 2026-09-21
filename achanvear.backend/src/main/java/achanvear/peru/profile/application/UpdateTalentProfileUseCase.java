package achanvear.peru.profile.application;

import achanvear.peru.profile.application.command.UpdateTalentProfileCommand;
import achanvear.peru.profile.application.dto.TalentProfileResponse;

public interface UpdateTalentProfileUseCase {

    TalentProfileResponse execute(UpdateTalentProfileCommand command);
}