package achanvear.peru.profile.application;

import achanvear.peru.profile.application.command.CreateTalentProfileCommand;
import achanvear.peru.profile.application.dto.TalentProfileResponse;

public interface CreateTalentProfileUseCase {

    TalentProfileResponse execute(CreateTalentProfileCommand command);
}