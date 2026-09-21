package achanvear.peru.interview.application.impl;

import achanvear.peru.interview.application.*;
import achanvear.peru.interview.application.command.*;
import achanvear.peru.interview.application.dto.*;
import achanvear.peru.interview.domain.event.InterviewCompletedEvent;
import achanvear.peru.interview.domain.event.ScreenViolationDetectedEvent;
import achanvear.peru.interview.domain.model.*;
import achanvear.peru.interview.domain.repository.InterviewRepository;
import achanvear.peru.interview.domain.service.InterviewSlotManager;
import achanvear.peru.interview.domain.service.ScoreCalculator;
import achanvear.peru.interview.infrastructure.external.AiInterviewerClient;
import achanvear.peru.interview.infrastructure.external.S3RecordingClient;
import achanvear.peru.interview.infrastructure.external.TextToSpeechClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class InterviewApplicationService implements
        ScheduleInterviewUseCase,
        StartInterviewSessionUseCase,
        SubmitAnswerUseCase,
        CompleteInterviewUseCase,
        ReportViolationUseCase,
        AbortInterviewUseCase,
        AbortInterviewSessionUseCase,
        SaveRecordingKeyUseCase,
        GetInterviewReportUseCase {

    private static final int MAX_VIOLATIONS = 3;

    private final InterviewRepository interviewRepository;
    private final InterviewSlotManager interviewSlotManager;
    private final AiInterviewerClient aiInterviewerClient;
    private final TextToSpeechClient textToSpeechClient;
    private final S3RecordingClient s3RecordingClient;
    private final ScoreCalculator scoreCalculator;
    private final achanvear.peru.shared.infrastructure.EventPublisher eventPublisher;

    public InterviewApplicationService(
            InterviewRepository interviewRepository,
            InterviewSlotManager interviewSlotManager,
            AiInterviewerClient aiInterviewerClient,
            TextToSpeechClient textToSpeechClient,
            S3RecordingClient s3RecordingClient,
            ScoreCalculator scoreCalculator,
            achanvear.peru.shared.infrastructure.EventPublisher eventPublisher
    ) {
        this.interviewRepository = interviewRepository;
        this.interviewSlotManager = interviewSlotManager;
        this.aiInterviewerClient = aiInterviewerClient;
        this.textToSpeechClient = textToSpeechClient;
        this.s3RecordingClient = s3RecordingClient;
        this.scoreCalculator = scoreCalculator;
        this.eventPublisher = eventPublisher;
    }

    @Override
    public InterviewSessionResponse execute(ScheduleInterviewCommand command) {
        InterviewId interviewId = InterviewId.of(UUID.randomUUID().toString());

        Optional<Integer> slot = interviewSlotManager.acquireSlot(interviewId.toString());
        if (slot.isEmpty()) {
            throw new IllegalStateException("No interview slots available right now");
        }

        InterviewerProfile profile = resolveProfile(command, slot.get());

        Interview interview = Interview.restore(
                interviewId,
                command.candidateId(),
                command.hiringProcessId(), // jobId en restore
                InterviewType.valueOf(command.interviewType()),
                InterviewStatus.SCHEDULED,
                null, // assignedSlot
                null, // abortReason
                profile,
                null, // score - variable interview no existe aún
                new RecordingSession(null, false),
                new ArrayList<>(), // questions
                new ArrayList<>(), // answers
                new ArrayList<>()  // violations
        );

        interviewRepository.save(interview);

        return new InterviewSessionResponse(
                interviewId.toString(),
                interview.getJobId(), // Corregido: usar getJobId() en lugar de getHiringProcessId()
                interview.getCandidateId(),
                interview.getType().name(),
                interview.getStatus().name(),
                profile.getName(),
                profile.getStyle(),
                profile.getVoice().name(),
                interviewSlotManager.availableSlots()
        );
    }

    @Override
    public InterviewSessionResponse execute(StartInterviewSessionCommand command) {
        Interview interview = getInterview(command.interviewId());

        String questionText = aiInterviewerClient.generateNextQuestion(
                interview.getType().name(),
                interview.getCandidateId(),
                interview.getInterviewerProfile().getCode()
        );

        String audioUrl = textToSpeechClient.synthesizeQuestionAudio(
                questionText,
                interview.getInterviewerProfile().getVoice()
        );

        Question firstQuestion = new Question(
                UUID.randomUUID().toString(),
                questionText,
                1
        );

        List<Question> updatedQuestions = new ArrayList<>(interview.getQuestions());
        updatedQuestions.add(firstQuestion);

        Interview updatedInterview = Interview.restore(
                interview.getId(),
                interview.getCandidateId(),
                interview.getJobId(),
                interview.getType(),
                InterviewStatus.IN_PROGRESS,
                null, // assignedSlot
                null, // abortReason
                interview.getInterviewerProfile(),
                interview.getScore(),
                new RecordingSession(
                        interview.getRecordingSession().getFileKey(),
                        true
                ),
                updatedQuestions,
                interview.getAnswers(),
                interview.getViolations()
        );

        interviewRepository.save(updatedInterview);

        return new InterviewSessionResponse(
                updatedInterview.getId().toString(),
                updatedInterview.getJobId(), // Corregido: usar getJobId()
                updatedInterview.getCandidateId(),
                updatedInterview.getType().name(),
                updatedInterview.getStatus().name(),
                updatedInterview.getInterviewerProfile().getName(),
                updatedInterview.getInterviewerProfile().getStyle(),
                updatedInterview.getInterviewerProfile().getVoice().name(),
                interviewSlotManager.availableSlots()
        );
    }

    @Override
    public SubmitAnswerResponse execute(SubmitAnswerCommand command) {
        Interview interview = getInterview(command.interviewId());

        // Evaluar respuesta usando IA
        AiInterviewerClient.AiAnswerEvaluation evaluation =
                aiInterviewerClient.evaluateAnswer(interview, command.questionId(), command.answerContent());

        // Registrar respuesta en el aggregate
        Answer answer = interview.submitAnswer(
                command.questionId(),
                command.answerContent(),
                evaluation.score()
        );

        // Agregar siguiente pregunta si la IA la devuelve
        Question nextQuestion = evaluation.nextQuestion();
        if (nextQuestion != null) {
            interview.addNextQuestion(nextQuestion);
        }

        // Completar entrevista si la IA indica que terminó
        if (evaluation.interviewCompleted()) {
            interview.complete();
            interviewSlotManager.releaseSlot(command.interviewId());
        }

        // Guardar cambios
        interviewRepository.save(interview);

        // Construir respuesta
        QuestionResponse nextQuestionResponse = null;
        if (nextQuestion != null) {
            String audioUrl = textToSpeechClient.synthesizeQuestionAudio(
                    nextQuestion.getContent(),
                    interview.getInterviewerProfile().getVoice()
            );
            nextQuestionResponse = new QuestionResponse(
                    nextQuestion.getId(),
                    nextQuestion.getContent(),
                    audioUrl
            );
        }

        return new SubmitAnswerResponse(
                command.interviewId(),
                command.questionId(),
                answer.getId(),
                evaluation.score(),
                evaluation.feedback(),
                nextQuestionResponse,
                evaluation.interviewCompleted()
        );
    }

    @Override
    public InterviewReportResponse execute(CompleteInterviewCommand command) {
        Interview interview = getInterview(command.interviewId());

        InterviewScore finalScore = scoreCalculator.calculate(interview);
        boolean passed = finalScore.getValue() >= 75;

        interview.complete();
        interviewRepository.save(interview);
        interviewSlotManager.releaseSlot(command.interviewId());

        // Publicar evento de entrevista completada
        eventPublisher.publish(new InterviewCompletedEvent(
                interview.getId(),
                interview.getType().name(),
                finalScore.getValue(),
                passed
        ));

        return new InterviewReportResponse(
                interview.getId().toString(),
                interview.getStatus().name(),
                interview.getType().name(),
                finalScore.getValue(),
                passed,
                interview.getInterviewerProfile() != null ? new InterviewReportResponse.InterviewerProfile(
                        interview.getInterviewerProfile().getName(),
                        interview.getInterviewerProfile().getVoice().name()
                ) : null,
                interview.getAssignedSlot() != null ? new InterviewReportResponse.AssignedSlot(
                        interview.getAssignedSlot(),
                        interview.getAssignedSlot().toString(),
                        (interview.getAssignedSlot() + 1) + ":00 PM"
                ) : null,
                interview.getRecordingSession() != null ? new InterviewReportResponse.RecordingInfo(
                        interview.getRecordingSession().getFileKey()
                ) : null,
                interview.getAbortReason() != null ? new InterviewReportResponse.AbortReason(
                        interview.getAbortReason()
                ) : null,
                new InterviewReportResponse.Totals(
                        interview.getQuestions().size(),
                        interview.getAnswers().size(),
                        interview.getViolations().size()
                ),
                interview.getQuestions().stream()
                        .map(q -> new InterviewReportResponse.QuestionItem(
                                q.getId(),
                                q.getContent(),
                                null // Question no tiene getAudioUrl()
                        ))
                        .toList(),
                interview.getAnswers().stream()
                        .map(a -> new InterviewReportResponse.AnswerItem(
                                a.getId(),
                                a.getQuestionId(),
                                a.getContent(),
                                a.getScore()
                        ))
                        .toList(),
                interview.getViolations().stream()
                        .map(v -> new InterviewReportResponse.ViolationItem(
                                v.type(),
                                v.count(),
                                v.occurredAt().toString()
                        ))
                        .toList()
        );
    }

    private Interview getInterview(String interviewId) {
        return interviewRepository.findById(InterviewId.of(interviewId))
                .orElseThrow(() -> new IllegalArgumentException("Interview not found: " + interviewId));
    }

    private int calculateAverageScore(List<Answer> answers) {
        // Since Answer doesn't have score, we'll use a default score for now
        // TODO: Implement score evaluation in Answer class
        return answers.isEmpty() ? 0 : 80; // Default score
    }

    private InterviewerProfile resolveProfile(ScheduleInterviewCommand command, int slotNumber) {
        if (command.interviewerProfileCode() != null && !command.interviewerProfileCode().isBlank()) {
            return profileByCode(command.interviewerProfileCode());
        }

        if (Boolean.TRUE.equals(command.leadershipProfile())) {
            return profileByCode("PROFILE_4");
        }

        if (command.theoryScore() != null && command.theoryScore() >= 85) {
            return profileByCode("PROFILE_3");
        }

        if (Boolean.TRUE.equals(command.conciseAnswers())) {
            return profileByCode("PROFILE_1");
        }

        return switch (slotNumber) {
            case 1 -> profileByCode("PROFILE_1");
            case 2 -> profileByCode("PROFILE_2");
            case 3 -> profileByCode("PROFILE_3");
            default -> profileByCode("PROFILE_4");
        };
    }

    private InterviewerProfile profileByCode(String code) {
        return switch (code) {
            case "PROFILE_1" -> new InterviewerProfile(
                    "PROFILE_1",
                    "Carlos Mendoza",
                    "Formal y directo",
                    InterviewerVoice.MALE1
            );
            case "PROFILE_2" -> new InterviewerProfile(
                    "PROFILE_2",
                    "Ana Quispe",
                    "Amigable y exploratorio",
                    InterviewerVoice.FEMALE1
            );
            case "PROFILE_3" -> new InterviewerProfile(
                    "PROFILE_3",
                    "Diego Torres",
                    "Muy tecnico y detallista",
                    InterviewerVoice.MALE2
            );
            default -> new InterviewerProfile(
                    "PROFILE_4",
                    "Sofia Vargas",
                    "Estrategico y orientado a impacto",
                    InterviewerVoice.FEMALE2
            );
        };
    }

    @Override
    public void execute(ReportViolationCommand command) {
        Interview interview = interviewRepository.findById(InterviewId.of(command.interviewId()))
                .orElseThrow(() -> new IllegalArgumentException("Interview not found"));

        Instant occurredAt = Instant.parse(command.timestamp());
        interview.reportViolation(command.type(), command.count(), occurredAt);
        interviewRepository.save(interview);

        eventPublisher.publish(new ScreenViolationDetectedEvent(
                interview.getId(),
                command.type(),
                command.count(),
                occurredAt
        ));
    }

    @Override
    public void execute(achanvear.peru.interview.application.command.AbortInterviewSessionCommand command) {
        Interview interview = interviewRepository.findById(InterviewId.of(command.interviewId()))
                .orElseThrow(() -> new IllegalArgumentException("Interview not found"));

        interview.abort(command.reason());
        interviewRepository.save(interview);
        interviewSlotManager.releaseSlot(command.interviewId());
        interview.pullDomainEvents().forEach(eventPublisher::publish);
    }

    @Override
    public void execute(AbortInterviewCommand command) {
        Interview interview = interviewRepository.findById(InterviewId.of(command.interviewId()))
                .orElseThrow(() -> new IllegalArgumentException("Interview not found"));

        boolean hadActiveSlot = interview.getStatus() == InterviewStatus.IN_PROGRESS;

        interview.abort();
        interviewRepository.save(interview);

        if (hadActiveSlot) {
            interviewSlotManager.releaseSlot(command.interviewId());
        }
    }

    @Override
    public void execute(SaveRecordingKeyCommand command) {
        Interview interview = interviewRepository.findById(InterviewId.of(command.interviewId()))
                .orElseThrow(() -> new IllegalArgumentException("Interview not found"));

        interview.saveRecording(command.fileKey());
        interviewRepository.save(interview);
    }

    @Override
    @Transactional(readOnly = true)
    public InterviewReportResponse execute(String interviewId) {
        Interview interview = interviewRepository.findById(InterviewId.of(interviewId))
                .orElseThrow(() -> new IllegalArgumentException("Interview not found"));

        Integer finalScore = scoreCalculator.calculate(interview).getValue();

        List<InterviewReportResponse.QuestionItem> questions = interview.getQuestions().stream()
                .map(this::toQuestionItem)
                .toList();

        List<InterviewReportResponse.AnswerItem> answers = interview.getAnswers().stream()
                .map(this::toAnswerItem)
                .toList();

        List<InterviewReportResponse.ViolationItem> violations = interview.getViolations().stream()
                .map(this::toViolationItem)
                .toList();

        return new InterviewReportResponse(
                interview.getId().toString(),
                interview.getStatus().name(),
                interview.getType().name(),
                finalScore,
                finalScore >= 75,

                interview.getInterviewerProfile() != null
                        ? new InterviewReportResponse.InterviewerProfile(
                        interview.getInterviewerProfile().getName(),
                        interview.getInterviewerProfile().getVoice().name()
                )
                        : null,

                interview.getAssignedSlot() != null
                        ? new InterviewReportResponse.AssignedSlot(
                        interview.getAssignedSlot(),
                        interview.getAssignedSlot().toString(),
                        (interview.getAssignedSlot() + 1) + ":00 PM"
                )
                        : null,

                interview.getRecordingSession() != null
                        ? new InterviewReportResponse.RecordingInfo(
                        interview.getRecordingSession().getFileKey()
                )
                        : null,

                interview.getAbortReason() != null
                        ? new InterviewReportResponse.AbortReason(
                        interview.getAbortReason()
                )
                        : null,

                new InterviewReportResponse.Totals(
                        questions.size(),
                        answers.size(),
                        violations.size()
                ),

                questions,
                answers,
                violations
        );
    }

    private InterviewReportResponse.QuestionItem toQuestionItem(Question question) {
        return new InterviewReportResponse.QuestionItem(
                question.getId(),
                question.getContent(),
                null // Question no tiene getAudioUrl()
        );
    }

    private InterviewReportResponse.AnswerItem toAnswerItem(Answer answer) {
        return new InterviewReportResponse.AnswerItem(
                answer.getId(),
                answer.getQuestionId(),
                answer.getContent(),
                answer.getScore()
        );
    }

    private InterviewReportResponse.ViolationItem toViolationItem(ScreenViolation violation) {
        return new InterviewReportResponse.ViolationItem(
                violation.type(),
                violation.count(),
                violation.occurredAt().toString()
        );
    }
}