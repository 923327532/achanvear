package achanvear.peru.jobs.infrastructure.persistence;

import achanvear.peru.jobs.domain.model.NotificationTiming;
import achanvear.peru.jobs.domain.model.RecruitmentAutomationConfig;
import achanvear.peru.jobs.domain.model.RecruitmentAutomationLevel;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Map;

@Component
public class RecruitmentAutomationConfigMapper {

    private final ObjectMapper objectMapper;

    public RecruitmentAutomationConfigMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public RecruitmentAutomationConfig toDomain(RecruitmentAutomationConfigJpaEntity entity) {
        if (entity == null) {
            return null;
        }

        Duration timeout = entity.getAutoInterviewTimeoutMinutes() != null
                ? Duration.ofMinutes(entity.getAutoInterviewTimeoutMinutes())
                : null;

        Map<String, String> criteria = parseScreeningCriteria(entity.getScreeningCriteria());

        NotificationTiming timing = entity.getNotificationTiming() != null
                ? NotificationTiming.valueOf(entity.getNotificationTiming())
                : NotificationTiming.IMMEDIATE;

        return RecruitmentAutomationConfig.restore(
                entity.getJobPostId(),
                RecruitmentAutomationLevel.valueOf(entity.getLevel()),
                entity.isAutoSendInterviewInvites(),
                timeout,
                criteria,
                entity.getWebhookUrl(),
                timing
        );
    }

    public RecruitmentAutomationConfigJpaEntity toEntity(RecruitmentAutomationConfig domain) {
        if (domain == null) {
            return null;
        }

        RecruitmentAutomationConfigJpaEntity entity = new RecruitmentAutomationConfigJpaEntity();
        entity.setJobPostId(domain.getJobPostId());
        entity.setLevel(domain.getLevel().name());
        entity.setAutoSendInterviewInvites(domain.isAutoSendInterviewInvites());

        if (domain.getAutoInterviewTimeout() != null) {
            entity.setAutoInterviewTimeoutMinutes((int) domain.getAutoInterviewTimeout().toMinutes());
        }

        entity.setScreeningCriteria(serializeScreeningCriteria(domain.getScreeningCriteria()));
        entity.setWebhookUrl(domain.getWebhookUrl());

        if (domain.getNotificationTiming() != null) {
            entity.setNotificationTiming(domain.getNotificationTiming().name());
        }

        return entity;
    }

    private Map<String, String> parseScreeningCriteria(String json) {
        if (json == null || json.isBlank()) {
            return Map.of();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, String>>() {});
        } catch (JsonProcessingException e) {
            return Map.of();
        }
    }

    private String serializeScreeningCriteria(Map<String, String> criteria) {
        if (criteria == null || criteria.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(criteria);
        } catch (JsonProcessingException e) {
            return null;
        }
    }
}
