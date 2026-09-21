package achanvear.peru.jobs.infrastructure.persistence;

import achanvear.peru.jobs.domain.model.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface JobPostMapper {

    default JobPost toDomain(JobPostJpaEntity entity) {
        if (entity == null) {
            return null;
        }

        List<JobApplication> applications = entity.getApplications().stream()
                .map(this::toApplicationDomain)
                .toList();

        SelectionMode selectionMode = entity.getSelectionMode() != null
                ? SelectionMode.valueOf(entity.getSelectionMode())
                : null;

        return JobPost.restore(
                new JobPostId(entity.getId()),
                entity.getCompanyId(),
                entity.getTitle(),
                entity.getDescription(),
                entity.getLocation(),
                JobType.valueOf(entity.getType()),
                entity.getSalaryMin(),
                entity.getSalaryMax(),
                entity.getCurrency(),
                entity.getVacancies(),
                entity.getRequirements(),
                JobStatus.valueOf(entity.getStatus()),
                applications,
                entity.getCreatedAt(),
                entity.getMaxApplicants(),
                entity.getClosingDate(),
                entity.getRequiredScoreThreshold(),
                entity.getSelectedCandidatesCount(),
                selectionMode
        );
    }

    default JobApplication toApplicationDomain(JobApplicationJpaEntity entity) {
        if (entity == null) {
            return null;
        }

        return JobApplication.restore(
                new JobApplicationId(entity.getId()),
                entity.getJobPostId(),
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

    @Mapping(target = "id", expression = "java(jobPost.getId().value())")
    @Mapping(target = "type", expression = "java(jobPost.getType().name())")
    @Mapping(target = "status", expression = "java(jobPost.getStatus().name())")
    @Mapping(target = "selectionMode", expression = "java(jobPost.getSelectionMode() != null ? jobPost.getSelectionMode().name() : null)")
    @Mapping(target = "applications", expression = "java(toApplicationEntities(jobPost.getApplications()))")
    JobPostJpaEntity toEntity(JobPost jobPost);

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
        entity.setScreeningScore(application.getScreeningScore());
        entity.setScreeningResult(application.getScreeningResult());
        entity.setTheoryScore(application.getTheoryScore());
        entity.setTechnicalScore(application.getTechnicalScore());
        entity.setFinalStatus(application.getFinalStatus());
        return entity;
    }

    List<JobApplicationJpaEntity> toApplicationEntities(List<JobApplication> applications);
}
