package achanvear.peru.freelance.application;

import achanvear.peru.freelance.application.dto.FreelancerProfileResponse;

public interface GetMyFreelancerProfileUseCase {

    FreelancerProfileResponse getMyProfile(String requesterUserId);
}