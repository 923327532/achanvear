package achanvear.peru.jobs.infrastructure.persistence;

import achanvear.peru.jobs.domain.model.ApplicationStatus;
import achanvear.peru.jobs.domain.model.JobApplication;
import achanvear.peru.jobs.domain.model.JobApplicationId;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;
import java.util.UUID;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ApplicationMapper {

    default JobApplication toDomain(JobApplicationJpaEntity entity) {
        if (entity == null) {
            return null;
        }
        UUID jobPostId = entity.getJobPost() != null ? entity.getJobPost().getId() : null;
        return JobApplication.restore(
                new JobApplicationId(entity.getId()),
                jobPostId,
                entity.getCandidateUserId(),
                entity.getCvUrl(),
                entity.getCoverLetter(),
                entity.getAppliedAt(),
                ApplicationStatus.valueOf(entity.getStatus()),
                entity.getScreeningScore(),
                entity.getScreeningResult(),
                entity.getTheoryScore(),
                entity.getTechnicalScore(),
                entity.getFinalStatus()
        );
    }

    default JobApplicationJpaEntity toEntity(JobApplication application) {
        if (application == null) {
            return null;
        }
        JobApplicationJpaEntity entity = new JobApplicationJpaEntity();
        entity.setId(application.getId().value());
        entity.setJobPostId(application.getJobPostId());
        entity.setCandidateUserId(application.getCandidateUserId());
        entity.setCvUrl(application.getCvUrl());
        entity.setCoverLetter(application.getCoverLetter());
        entity.setAppliedAt(application.getAppliedAt());
        entity.setStatus(application.getStatus().name());
        return entity;
    }
}