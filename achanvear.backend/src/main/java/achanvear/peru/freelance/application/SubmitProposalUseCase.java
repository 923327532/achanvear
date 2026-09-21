package achanvear.peru.freelance.application;

import achanvear.peru.freelance.application.command.SubmitProposalCommand;
import achanvear.peru.freelance.application.dto.FreelanceProjectResponse;

public interface SubmitProposalUseCase {

    FreelanceProjectResponse execute(SubmitProposalCommand command);
}