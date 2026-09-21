package achanvear.peru.interview.infrastructure.persistence;

import achanvear.peru.interview.domain.model.Answer;
import achanvear.peru.interview.domain.model.Interview;
import achanvear.peru.interview.domain.model.InterviewId;
import achanvear.peru.interview.domain.model.InterviewStatus;
import achanvear.peru.interview.domain.model.InterviewType;
import achanvear.peru.interview.domain.model.InterviewerProfile;
import achanvear.peru.interview.domain.model.InterviewerVoice;
import achanvear.peru.interview.domain.model.Question;
import achanvear.peru.interview.domain.model.RecordingSession;
import achanvear.peru.interview.domain.model.ScreenViolation;
import achanvear.peru.interview.infrastructure.persistence.entity.AnswerJpaEntity;
import achanvear.peru.interview.infrastructure.persistence.entity.InterviewJpaEntity;
import achanvear.peru.interview.infrastructure.persistence.entity.InterviewViolationJpaEntity;
import achanvear.peru.interview.infrastructure.persistence.entity.QuestionJpaEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Component
public class InterviewMapper {

    public InterviewJpaEntity toEntity(Interview interview) {
        InterviewJpaEntity entity = new InterviewJpaEntity();
        entity.setId(interview.getId().toString());
        entity.setHiringProcessId(interview.getJobId()); // jobId maps to hiringProcessId
        entity.setCandidateId(interview.getCandidateId());
        entity.setInterviewType(interview.getType().name());
        entity.setStatus(interview.getStatus().name());

        if (interview.getInterviewerProfile() != null) {
            entity.setInterviewerName(interview.getInterviewerProfile().getName());
            entity.setInterviewerVoice(interview.getInterviewerProfile().getVoice().name());
        }

        if (interview.getRecordingSession() != null) {
            entity.setRecordingFileKey(interview.getRecordingSession().getFileKey());
            entity.setRecordingActive(true);
        }

        List<QuestionJpaEntity> questionEntities = new ArrayList<>();
        for (int i = 0; i < interview.getQuestions().size(); i++) {
            Question question = interview.getQuestions().get(i);
            QuestionJpaEntity questionEntity = new QuestionJpaEntity();
            questionEntity.setId(question.getId());
            questionEntity.setInterview(entity);
            questionEntity.setOrderNumber(i + 1);
            questionEntity.setContent(question.getContent());
            questionEntities.add(questionEntity);
        }
        entity.setQuestions(questionEntities);

        List<AnswerJpaEntity> answerEntities = new ArrayList<>();
        for (int i = 0; i < interview.getAnswers().size(); i++) {
            Answer answer = interview.getAnswers().get(i);
            AnswerJpaEntity answerEntity = new AnswerJpaEntity();
            answerEntity.setId(answer.getId());
            answerEntity.setInterview(entity);
            answerEntity.setQuestionId(answer.getQuestionId());
            answerEntity.setContent(answer.getContent());
            answerEntity.setAnsweredAt(answer.getAnsweredAt() != null ? answer.getAnsweredAt() : java.time.Instant.now());
            answerEntities.add(answerEntity);
        }
        entity.setAnswers(answerEntities);

        List<InterviewViolationJpaEntity> violationEntities = new ArrayList<>();
        for (ScreenViolation violation : interview.getViolations()) {
            InterviewViolationJpaEntity violationEntity = new InterviewViolationJpaEntity();
            violationEntity.setId(UUID.randomUUID().toString());
            violationEntity.setInterview(entity);
            violationEntity.setType(violation.type());
            violationEntity.setOccurrenceCount(violation.count());
            violationEntity.setOccurredAt(violation.occurredAt());
            violationEntities.add(violationEntity);
        }
        entity.setViolations(violationEntities);

        return entity;
    }

    public Interview toDomain(InterviewJpaEntity entity) {
        InterviewerProfile interviewerProfile = null;
        if (entity.getInterviewerName() != null && entity.getInterviewerVoice() != null) {
            interviewerProfile = new InterviewerProfile(
                    "DEFAULT", // code
                    entity.getInterviewerName(),
                    "PROFESSIONAL", // style
                    InterviewerVoice.valueOf(entity.getInterviewerVoice())
            );
        }

        RecordingSession recordingSession = null;
        if (entity.getRecordingFileKey() != null) {
            recordingSession = new RecordingSession(entity.getRecordingFileKey(), 
                    entity.getRecordingActive() != null ? entity.getRecordingActive() : false);
        }

        List<Question> questions = entity.getQuestions().stream()
                .map(q -> new Question(
                        q.getId(),
                        q.getContent(),
                        q.getOrderNumber()
                ))
                .toList();

        List<Answer> answers = entity.getAnswers().stream()
                .map(a -> new Answer(
                        a.getId(),
                        a.getQuestionId(),
                        a.getContent(),
                        null, // score - not in entity
                        a.getAnsweredAt()
                ))
                .toList();

        List<ScreenViolation> violations = entity.getViolations().stream()
                .map(v -> new ScreenViolation(
                        v.getType(),
                        v.getType(),
                        v.getOccurrenceCount(),
                        v.getOccurredAt()
                ))
                .toList();

        return Interview.restore(
                InterviewId.of(entity.getId()),
                entity.getCandidateId(),
                entity.getHiringProcessId(), // hiringProcessId maps to jobId in domain
                InterviewType.valueOf(entity.getInterviewType()),
                InterviewStatus.valueOf(entity.getStatus()),
                null, // assignedSlot - not in entity
                null, // abortReason - not in entity
                interviewerProfile,
                null, recordingSession,
                questions,
                answers,
                violations
        );
    }
}
