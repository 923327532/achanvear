package achanvear.peru.jobs.infrastructure.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

public interface RecruitmentAutomationConfigJpaRepository extends
        JpaRepository<RecruitmentAutomationConfigJpaEntity, UUID> {

    Optional<RecruitmentAutomationConfigJpaEntity> findByJobPostId(UUID jobPostId);

    void deleteByJobPostId(UUID jobPostId);

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO recruitment_automation_configs " +
           "(job_post_id, automation_level, auto_send_interview_invites, auto_interview_timeout_minutes, " +
           "screening_criteria, webhook_url, configured_at, created_at, updated_at) " +
           "VALUES (:jobPostId, :level, :autoSendInterviewInvites, :autoInterviewTimeoutMinutes, " +
           "CAST(:screeningCriteria AS jsonb), :webhookUrl, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) " +
           "ON CONFLICT (job_post_id) DO UPDATE SET " +
           "automation_level = :level, " +
           "auto_send_interview_invites = :autoSendInterviewInvites, " +
           "auto_interview_timeout_minutes = :autoInterviewTimeoutMinutes, " +
           "screening_criteria = CAST(:screeningCriteria AS jsonb), " +
           "webhook_url = :webhookUrl, " +
           "configured_at = CURRENT_TIMESTAMP, " +
           "updated_at = CURRENT_TIMESTAMP", nativeQuery = true)
    void upsertWithJsonbCast(
            @Param("jobPostId") UUID jobPostId,
            @Param("level") String level,
            @Param("autoSendInterviewInvites") boolean autoSendInterviewInvites,
            @Param("autoInterviewTimeoutMinutes") Integer autoInterviewTimeoutMinutes,
            @Param("screeningCriteria") String screeningCriteria,
            @Param("webhookUrl") String webhookUrl
    );
}
