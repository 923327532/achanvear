package achanvear.peru.jobs.application;

import achanvear.peru.jobs.application.dto.JobPostPageResponse;
import achanvear.peru.jobs.application.query.JobSearchQuery;

public interface SearchJobsUseCase {

    JobPostPageResponse execute(JobSearchQuery query);
}