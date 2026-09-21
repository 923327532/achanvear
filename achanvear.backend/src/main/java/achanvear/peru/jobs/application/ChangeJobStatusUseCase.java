package achanvear.peru.jobs.application;

import achanvear.peru.jobs.application.command.ChangeJobStatusCommand;
import achanvear.peru.jobs.application.dto.JobPostResponse;

public interface ChangeJobStatusUseCase {

    JobPostResponse execute(ChangeJobStatusCommand command);
}