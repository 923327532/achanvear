package achanvear.peru.freelance.application;

import achanvear.peru.freelance.application.command.UpdateFreelanceProjectCommand;
import achanvear.peru.freelance.application.dto.FreelanceProjectResponse;

public interface UpdateFreelanceProjectUseCase {

    FreelanceProjectResponse execute(UpdateFreelanceProjectCommand command);
}
