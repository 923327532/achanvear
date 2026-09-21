package achanvear.peru.jobs.application;

import achanvear.peru.jobs.application.command.ApplyJobCommand;
import achanvear.peru.jobs.application.dto.JobPostResponse;

public interface ApplyToJobUseCase {

    JobPostResponse execute(ApplyJobCommand command);
}