package achanvear.peru.jobs.infrastructure.persistence;

import achanvear.peru.jobs.domain.model.RecruitmentAutomationConfig;
import achanvear.peru.jobs.domain.repository.RecruitmentAutomationConfigRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public class RecruitmentAutomationConfigRepositoryImpl implements RecruitmentAutomationConfigRepository {

    private final RecruitmentAutomationConfigJpaRepository jpaRepository;
    private final RecruitmentAutomationConfigMapper mapper;

    public RecruitmentAutomationConfigRepositoryImpl(
            RecruitmentAutomationConfigJpaRepository jpaRepository,
            RecruitmentAutomationConfigMapper mapper
    ) {
        this.jpaRepository = jpaRepository;
        this.mapper = mapper;
    }

    @Override
    public Optional<RecruitmentAutomationConfig> findByJobPostId(UUID jobPostId) {
        return jpaRepository.findByJobPostId(jobPostId).map(mapper::toDomain);
    }

    @Override
    public void save(RecruitmentAutomationConfig config) {
        RecruitmentAutomationConfigJpaEntity entity = mapper.toEntity(config);
        
        // Use native query with explicit jsonb casting to avoid type conversion issues
        jpaRepository.upsertWithJsonbCast(
                entity.getJobPostId(),
                entity.getLevel(),
                entity.isAutoSendInterviewInvites(),
                entity.getAutoInterviewTimeoutMinutes(),
                entity.getScreeningCriteria(),
                entity.getWebhookUrl()
        );
    }

    @Override
    public void deleteByJobPostId(UUID jobPostId) {
        jpaRepository.deleteByJobPostId(jobPostId);
    }
}
