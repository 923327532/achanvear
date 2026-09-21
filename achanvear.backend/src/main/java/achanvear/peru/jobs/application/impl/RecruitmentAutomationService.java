package achanvear.peru.jobs.application.impl;

import achanvear.peru.jobs.application.ManageRecruitmentAutomationUseCase;
import achanvear.peru.jobs.application.command.ConfigureAutomationCommand;
import achanvear.peru.jobs.application.dto.RecruitmentAutomationConfigResponse;
import achanvear.peru.jobs.domain.model.JobPost;
import achanvear.peru.jobs.domain.model.JobPostId;
import achanvear.peru.jobs.domain.model.NotificationTiming;
import achanvear.peru.jobs.domain.model.RecruitmentAutomationConfig;
import achanvear.peru.jobs.domain.model.RecruitmentAutomationLevel;
import achanvear.peru.jobs.domain.repository.JobPostRepository;
import achanvear.peru.jobs.domain.repository.RecruitmentAutomationConfigRepository;
import achanvear.peru.shared.domain.exception.ResourceNotFoundException;
import achanvear.peru.shared.exception.BusinessRuleViolationException;
import achanvear.peru.shared.exception.ForbiddenOperationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/**
 * Service for managing recruitment automation configuration.
 * Provides base structure for Python bot integration.
 */
@Service
@Transactional
public class RecruitmentAutomationService implements ManageRecruitmentAutomationUseCase {

    private final RecruitmentAutomationConfigRepository configRepository;
    private final JobPostRepository jobPostRepository;

    public RecruitmentAutomationService(
            RecruitmentAutomationConfigRepository configRepository,
            JobPostRepository jobPostRepository
    ) {
        this.configRepository = configRepository;
        this.jobPostRepository = jobPostRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public RecruitmentAutomationConfigResponse getConfig(String jobPostId, String companyId, boolean superAdmin) {
        JobPost jobPost = jobPostRepository.findById(JobPostId.from(jobPostId))
                .orElseThrow(() -> new ResourceNotFoundException("Job post not found"));

        authorizeCompanyOwnership(jobPost, companyId, superAdmin);

        RecruitmentAutomationConfig config = configRepository.findByJobPostId(UUID.fromString(jobPostId))
                .orElseGet(() -> RecruitmentAutomationConfig.create(
                        UUID.fromString(jobPostId),
                        RecruitmentAutomationLevel.MANUAL
                ));

        return toResponse(config);
    }

    @Override
    public RecruitmentAutomationConfigResponse configure(ConfigureAutomationCommand command) {
        JobPost jobPost = jobPostRepository.findById(JobPostId.from(command.jobPostId()))
                .orElseThrow(() -> new ResourceNotFoundException("Job post not found"));

        authorizeCompanyOwnership(jobPost, command.companyId(), command.superAdmin());

        RecruitmentAutomationLevel level = RecruitmentAutomationLevel.valueOf(
                command.automationLevel().trim().toUpperCase()
        );

        RecruitmentAutomationConfig config = configRepository.findByJobPostId(
                UUID.fromString(command.jobPostId())
        ).orElseGet(() -> RecruitmentAutomationConfig.create(
                UUID.fromString(command.jobPostId()),
                level
        ));

        config.updateLevel(level);

        if (command.autoSendInterviewInvites()) {
            Duration timeout = command.autoInterviewTimeoutMinutes() != null
                    ? Duration.ofMinutes(Long.parseLong(command.autoInterviewTimeoutMinutes()))
                    : Duration.ofDays(7);
            config.enableAutoInterview(timeout, command.webhookUrl());
        }

        if (command.screeningCriteria() != null && !command.screeningCriteria().isEmpty()) {
            config.updateScreeningCriteria(command.screeningCriteria());
        }

        if (command.notificationTiming() != null && !command.notificationTiming().isBlank()) {
            try {
                NotificationTiming timing = NotificationTiming.valueOf(command.notificationTiming().trim().toUpperCase());
                config.setNotificationTiming(timing);
            } catch (IllegalArgumentException e) {
                // Ignorar valor invalido, mantener el actual
            }
        }

        configRepository.save(config);

        return toResponse(config);
    }

    private void authorizeCompanyOwnership(JobPost jobPost, String requesterCompanyId, boolean superAdmin) {
        if (superAdmin) {
            return;
        }

        if (requesterCompanyId == null || requesterCompanyId.isBlank()) {
            throw new ForbiddenOperationException("Company context is required");
        }

        if (!jobPost.belongsTo(UUID.fromString(requesterCompanyId))) {
            throw new ForbiddenOperationException("You do not have permission to manage this job post");
        }
    }

    private RecruitmentAutomationConfigResponse toResponse(RecruitmentAutomationConfig config) {
        String timeoutMinutes = config.getAutoInterviewTimeout() != null
                ? String.valueOf(config.getAutoInterviewTimeout().toMinutes())
                : null;

        return new RecruitmentAutomationConfigResponse(
                config.getJobPostId().toString(),
                config.getLevel().name(),
                config.isAutoSendInterviewInvites(),
                timeoutMinutes,
                config.getScreeningCriteria(),
                config.getWebhookUrl(),
                Instant.now().toString(),
                config.getNotificationTiming() != null ? config.getNotificationTiming().name() : "IMMEDIATE"
        );
    }
}
