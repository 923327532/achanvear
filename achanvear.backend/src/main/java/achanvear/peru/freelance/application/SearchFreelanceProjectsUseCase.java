package achanvear.peru.freelance.application;

import achanvear.peru.freelance.application.dto.FreelanceProjectPageResponse;
import achanvear.peru.freelance.application.query.FreelanceProjectSearchQuery;

import java.util.UUID;

public interface SearchFreelanceProjectsUseCase {

    FreelanceProjectPageResponse execute(FreelanceProjectSearchQuery query);

    FreelanceProjectPageResponse execute(FreelanceProjectSearchQuery query, UUID authenticatedUserId);
}
