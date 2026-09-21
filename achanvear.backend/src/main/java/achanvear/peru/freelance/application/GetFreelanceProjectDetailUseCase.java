package achanvear.peru.freelance.application;

import achanvear.peru.freelance.application.dto.FreelanceProjectResponse;
import org.springframework.transaction.annotation.Transactional;

public interface GetFreelanceProjectDetailUseCase {

    @Transactional(readOnly = true)
    FreelanceProjectResponse getFreelanceProjectDetail(String projectId);

    FreelanceProjectResponse getById(String projectId);

    FreelanceProjectResponse getById(String projectId, java.util.UUID authenticatedUserId);
}
