package achanvear.peru.jobs.domain.repository;

import achanvear.peru.jobs.domain.model.RecruitmentAutomationConfig;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for recruitment automation configuration.
 */
public interface RecruitmentAutomationConfigRepository {

    Optional<RecruitmentAutomationConfig> findByJobPostId(UUID jobPostId);

    void save(RecruitmentAutomationConfig config);

    void deleteByJobPostId(UUID jobPostId);
}
