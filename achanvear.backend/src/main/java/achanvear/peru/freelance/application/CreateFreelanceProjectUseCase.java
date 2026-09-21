package achanvear.peru.freelance.application;

import achanvear.peru.freelance.application.command.CreateFreelanceProjectCommand;
import achanvear.peru.freelance.application.dto.FreelanceProjectResponse;

public interface CreateFreelanceProjectUseCase {

    FreelanceProjectResponse execute(CreateFreelanceProjectCommand command);
}