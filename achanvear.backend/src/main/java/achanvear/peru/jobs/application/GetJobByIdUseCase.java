package achanvear.peru.jobs.application;

import achanvear.peru.jobs.application.dto.JobPostResponse;

public interface GetJobByIdUseCase {

    JobPostResponse execute(String jobPostId);
}