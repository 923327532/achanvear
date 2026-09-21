package achanvear.peru.freelance.application;

import achanvear.peru.freelance.application.dto.FreelancerProfileResponse;

public interface GetFreelancerProfileByIdUseCase {

    FreelancerProfileResponse getFreelancerProfileById(String freelancerId);
}
