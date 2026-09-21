package achanvear.peru.freelance.application;

import achanvear.peru.freelance.application.command.CreateFreelancerProfileCommand;
import achanvear.peru.freelance.application.dto.FreelancerProfileResponse;

public interface CreateFreelancerProfileUseCase {

    FreelancerProfileResponse execute(CreateFreelancerProfileCommand command);
}