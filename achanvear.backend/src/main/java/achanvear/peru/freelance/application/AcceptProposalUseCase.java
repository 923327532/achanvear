package achanvear.peru.freelance.application;

import achanvear.peru.freelance.application.command.AcceptProposalCommand;
import achanvear.peru.freelance.application.dto.FreelanceProjectResponse;

public interface AcceptProposalUseCase {

    FreelanceProjectResponse execute(AcceptProposalCommand command);
}