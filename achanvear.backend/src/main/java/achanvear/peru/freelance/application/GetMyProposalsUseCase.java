package achanvear.peru.freelance.application;

import achanvear.peru.freelance.application.dto.FreelanceProjectPageResponse;

public interface GetMyProposalsUseCase {

    FreelanceProjectPageResponse execute(String freelancerUserId, int page, int size, String sortBy, String sortDirection);
}
