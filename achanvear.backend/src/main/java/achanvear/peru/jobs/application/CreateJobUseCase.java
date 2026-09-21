package achanvear.peru.jobs.application;

import achanvear.peru.jobs.application.command.CreateJobCommand;
import achanvear.peru.jobs.application.dto.JobPostResponse;

public interface CreateJobUseCase {

    JobPostResponse execute(CreateJobCommand command);
}