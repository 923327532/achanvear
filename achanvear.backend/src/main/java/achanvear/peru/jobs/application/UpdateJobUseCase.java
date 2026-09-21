package achanvear.peru.jobs.application;

import achanvear.peru.jobs.application.command.UpdateJobCommand;
import achanvear.peru.jobs.application.dto.JobPostResponse;

public interface UpdateJobUseCase {

    JobPostResponse execute(UpdateJobCommand command);
}