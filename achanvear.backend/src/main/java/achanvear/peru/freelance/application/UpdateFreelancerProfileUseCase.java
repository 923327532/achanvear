package achanvear.peru.freelance.application;

import achanvear.peru.freelance.application.command.UpdateFreelancerProfileCommand;
import achanvear.peru.freelance.application.dto.FreelancerProfileResponse;

public interface UpdateFreelancerProfileUseCase {

    FreelancerProfileResponse execute(UpdateFreelancerProfileCommand command);
}